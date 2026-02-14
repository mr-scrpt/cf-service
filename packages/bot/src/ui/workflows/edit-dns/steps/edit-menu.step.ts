import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../core/workflow.step';
import { IStepResult, NextStepResult, ExitFlowResult, JumpToStepResult } from '../../core/step.result';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { FIELD_DEFINITIONS, getFieldsForType, DnsFieldDefinition } from '../edit-dns.config';
import { MenuCallbacks } from '../../../menus/main.menu';
import { Callback, CallbackPattern, CallbackSerializer, DnsEditFieldPayload, DnsSaveRecordPayload } from '../../../callbacks/callback-data';
import { EditDnsStep, EditDnsAction, DnsFieldName } from '../edit-dns.constants';

export class EditMenuWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = EditDnsStep.EDIT_MENU;

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const record = state.getEffectiveRecord();
        const layoutKeys = getFieldsForType(record.type);

        // Format Name Relative to Zone
        let displayName = record.name;
        const zoneName = state.zoneName;
        if (zoneName) {
            const suffix = '.' + zoneName;
            if (displayName.endsWith(suffix)) {
                displayName = displayName.substring(0, displayName.length - suffix.length);
            }
        }

        let message = `✏️ <b>Editing Record</b>: ${displayName} (${record.type})\n\n`;

        for (const key of layoutKeys) {
            const def = FIELD_DEFINITIONS[key];
            if (!def) continue;

            const originalVal = this.resolveValue(state.originalRecord, def, key);
            const currentVal = this.resolveValue(record, def, key);

            message += this.formatChange(def.label, originalVal, currentVal);
        }

        message += `\n👇 Select a field to edit:`;

        const keyboard = new InlineKeyboard();
        let rowCount = 0;

        for (const key of layoutKeys) {
            const def = FIELD_DEFINITIONS[key];
            if (!def) continue;

            keyboard.text(def.label, Callback.dnsEditField(key));
            rowCount++;
            if (rowCount % 2 === 0) keyboard.row();
        }
        if (rowCount % 2 !== 0) keyboard.row();

        keyboard.text('💾 Save Changes', Callback.dnsSaveRecord()).text('❌ Cancel', Callback.dnsEditCancel());

        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

        // Wait for EITHER edit field OR save/cancel action
        const callback = await conversation.waitForCallbackQuery([
            CallbackPattern.dnsEditField(),
            CallbackPattern.dnsSaveRecord()
        ]);
        await callback.answerCallbackQuery();

        const data = callback.callbackQuery.data;

        if (CallbackPattern.dnsEditField().test(data)) {
            const payload = CallbackSerializer.deserialize<DnsEditFieldPayload>(data);
            const field = payload.payload.field as DnsFieldName;

            if (FIELD_DEFINITIONS[field]) {
                state.setActiveField(field);
                return new JumpToStepResult(EditDnsStep.EDIT_FIELD);
            }
        }

        if (CallbackPattern.dnsSaveRecord().test(data)) {
            const payload = CallbackSerializer.deserialize<DnsSaveRecordPayload>(data);

            if (payload.payload.action === EditDnsAction.SAVE) {
                return new JumpToStepResult(EditDnsStep.SAVE_CHANGES);
            }

            if (payload.payload.action === EditDnsAction.CANCEL) {
                await ctx.reply('❌ Edit cancelled.', {
                    reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
                });
                return new ExitFlowResult();
            }
        }

        return new JumpToStepResult(EditDnsStep.EDIT_MENU);
    }

    private resolveValue(record: any, def: DnsFieldDefinition, key: string): any {
        if (!record) return undefined;
        if (def.path) {
            let val = record;
            for (const p of def.path) {
                val = val ? val[p] : undefined;
            }
            return val;
        }
        // If no path, assume config key maps to record key
        return record[key];
    }

    private formatChange(label: string, original: any, current: any) {
        // Safe emoji stripping for display if needed, but full label is fine
        const cleanLabel = label.includes(' ') ? label.split(' ').slice(1).join(' ') : label;

        if (String(original) !== String(current)) {
            return `🔹 <b>${cleanLabel}:</b> ${original} ➝ <b>${current}</b>\n`;
        }
        return `🔹 <b>${cleanLabel}:</b> ${current}\n`;
    }
}
