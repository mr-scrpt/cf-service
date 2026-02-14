import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsWorkflowContext } from '../create-dns.workflow.context';
import { DnsFieldDefinition } from '../config/create-dns.config';
import { z } from 'zod';
import { getDnsContentSchema } from '@cloudflare-bot/shared';
import { Callback, CallbackPattern, CallbackSerializer, DnsEditValuePayload, DnsEditBooleanPayload } from '../../../callbacks/callback-data';
import {
    formatTextInputPrompt,
    formatNumberInputPrompt,
    formatSelectInputPrompt,
    formatBooleanInputPrompt,
    InputMessages
} from '../../../common/templates/input.templates';
import { buildBooleanKeyboard, buildSelectionKeyboard } from '../../../keyboards/common.keyboard';
import { CreateDnsTrigger, CreateDnsAction, DnsInputType } from '../config/create-dns.constants';

export interface InputStrategy {
    handle(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
        fieldDef: DnsFieldDefinition,
        currentValue: unknown
    ): Promise<void>;
}

export class TextInputStrategy implements InputStrategy {
    async handle(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
        fieldDef: DnsFieldDefinition,
        currentValue: unknown
    ): Promise<void> {
        let msgText = formatTextInputPrompt(fieldDef.label, currentValue);
        if (fieldDef.hint) {
            msgText += `\n<i>${fieldDef.hint}</i>`;
        }

        await ctx.reply(msgText, { parse_mode: 'HTML' });

        while (true) {
            const msg = await conversation.waitFor(CreateDnsTrigger.TEXT);
            const newValue = msg.message.text.trim();

            const error = this.validateValue(newValue, fieldDef, state);
            if (!error) {
                this.updateState(state, fieldDef, newValue);
                return;
            }

            await ctx.reply(`❌ ${error}\nPlease try again:`);
        }
    }

    protected validateValue(value: string, fieldDef: DnsFieldDefinition, state: CreateDnsWorkflowContext): string | null {
        // 1. Basic Schema Validation
        const schemaResult = fieldDef.schema.safeParse(value);
        if (!schemaResult.success) {
            return schemaResult.error.issues[0].message;
        }

        // 2. Contextual Validation for Content
        if (fieldDef.label === '📝 Content' && state.type) {
            const contentSchema = getDnsContentSchema(state.type);
            const contentResult = contentSchema.safeParse(value);
            if (!contentResult.success) {
                return contentResult.error.issues[0].message;
            }
        }

        return null;
    }

    protected updateState(state: CreateDnsWorkflowContext, fieldDef: DnsFieldDefinition, newValue: unknown) {
        if (fieldDef.path && fieldDef.path[0] === 'data') {
            // Deep Merge for SRV Data
            const currentDraft = (state.draftRecord as any).data || {};
            const subKey = fieldDef.path[1];

            state.updateDraftRecord({
                data: { ...currentDraft, [subKey]: newValue }
            } as any);
        } else {
            state.updateDraftRecord({ [state.getActiveField()]: newValue } as any);
        }
    }
}

export class NumberInputStrategy extends TextInputStrategy {
    async handle(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
        fieldDef: DnsFieldDefinition,
        currentValue: unknown
    ): Promise<void> {
        let msgText = formatNumberInputPrompt(fieldDef.label, currentValue);
        if (fieldDef.hint) {
            msgText += `\n<i>${fieldDef.hint}</i>`;
        }

        await ctx.reply(msgText, { parse_mode: 'HTML' });

        while (true) {
            const msg = await conversation.waitFor(CreateDnsTrigger.TEXT);
            const rawValue = msg.message.text.trim();
            const num = parseFloat(rawValue);

            if (isNaN(num)) {
                await ctx.reply(InputMessages.INVALID_NUMBER);
                continue;
            }

            // Validate against Zod schema (e.g. min/max)
            const schemaResult = fieldDef.schema.safeParse(num);
            if (!schemaResult.success) {
                await ctx.reply(`❌ ${schemaResult.error.issues[0].message}\nPlease try again:`);
                continue;
            }

            this.updateState(state, fieldDef, num);
            return;
        }
    }
}

export class SelectInputStrategy extends TextInputStrategy {
    async handle(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
        fieldDef: DnsFieldDefinition,
        currentValue: unknown
    ): Promise<void> {
        const strategy = fieldDef.input;
        if (strategy.type !== DnsInputType.SELECT) throw new Error('Invalid strategy for SelectInput');

        const options = strategy.options || [];

        const keyboard = buildSelectionKeyboard(
            options.map(opt => ({
                label: opt.label,
                callback: Callback.dnsEditValue(opt.value)
            })),
            Callback.dnsEditValueCancel()
        );

        let msgText = formatSelectInputPrompt(fieldDef.label, currentValue);
        if (fieldDef.hint) {
            msgText += `\n<i>${fieldDef.hint}</i>`;
        }

        await ctx.reply(msgText, { reply_markup: keyboard, parse_mode: 'HTML' });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsEditValue());
        await callback.answerCallbackQuery();

        const data = CallbackSerializer.deserialize<DnsEditValuePayload>(callback.callbackQuery.data);

        // Use Action Constant
        if (data.payload.action === CreateDnsAction.CANCEL) {
            await ctx.reply(InputMessages.CANCELLED);
            return;
        }

        const value = data.payload.value;
        let newValue = value;

        if (typeof value === 'string' && options.length > 0 && typeof options[0].value === 'number') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) newValue = parsed;
        }

        this.updateState(state, fieldDef, newValue);
    }
}

export class BooleanInputStrategy extends TextInputStrategy {
    async handle(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
        fieldDef: DnsFieldDefinition,
        currentValue: unknown
    ): Promise<void> {
        const keyboard = buildBooleanKeyboard({
            currentValue,
            trueCallback: Callback.dnsEditBoolean(true),
            falseCallback: Callback.dnsEditBoolean(false),
            cancelCallback: Callback.dnsEditBooleanCancel()
        });

        let msgText = formatBooleanInputPrompt(fieldDef.label);
        if (fieldDef.hint) {
            msgText += `\n<i>${fieldDef.hint}</i>`;
        }

        await ctx.reply(msgText, { reply_markup: keyboard, parse_mode: 'HTML' });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsEditBoolean());
        await callback.answerCallbackQuery();

        const data = CallbackSerializer.deserialize<DnsEditBooleanPayload>(callback.callbackQuery.data);

        if (data.payload.action === CreateDnsAction.CANCEL) return;

        this.updateState(state, fieldDef, data.payload.value);
    }
}

// Registry
export const INPUT_STRATEGIES: Record<string, InputStrategy> = {
    [DnsInputType.TEXT]: new TextInputStrategy(),
    [DnsInputType.NUMBER]: new NumberInputStrategy(),
    [DnsInputType.SELECT]: new SelectInputStrategy(),
    [DnsInputType.BOOLEAN]: new BooleanInputStrategy()
};
