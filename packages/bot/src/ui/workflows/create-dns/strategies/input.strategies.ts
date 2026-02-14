import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsWorkflowContext } from '../create-dns.workflow.context';
import { DnsFieldDefinition } from '../config/create-dns.config';
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
        await ctx.reply(
            formatTextInputPrompt(fieldDef.label, currentValue),
            { parse_mode: 'HTML' }
        );

        const msg = await conversation.waitFor(CreateDnsTrigger.TEXT);
        const newValue = msg.message.text.trim();

        this.updateState(state, fieldDef, newValue);
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
        await ctx.reply(
            formatNumberInputPrompt(fieldDef.label, currentValue),
            { parse_mode: 'HTML' }
        );

        const msg = await conversation.waitFor(CreateDnsTrigger.TEXT);
        const rawValue = msg.message.text.trim();
        const num = parseFloat(rawValue);

        if (isNaN(num)) {
            await ctx.reply(InputMessages.INVALID_NUMBER);
            return;
        }

        this.updateState(state, fieldDef, num);
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

        await ctx.reply(formatSelectInputPrompt(fieldDef.label, currentValue), { reply_markup: keyboard });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsEditValue());
        await callback.answerCallbackQuery();

        const data = CallbackSerializer.deserialize<DnsEditValuePayload>(callback.callbackQuery.data);

        // Use Action Constant
        if (data.payload.action === 'cancel') { // Using string literal as used in callback-data
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

        await ctx.reply(formatBooleanInputPrompt(fieldDef.label), { reply_markup: keyboard });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsEditBoolean());
        await callback.answerCallbackQuery();

        const data = CallbackSerializer.deserialize<DnsEditBooleanPayload>(callback.callbackQuery.data);

        if (data.payload.action === 'cancel') return;

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
