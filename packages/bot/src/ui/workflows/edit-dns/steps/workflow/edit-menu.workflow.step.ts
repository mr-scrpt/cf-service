import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult, ExitFlowResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { DnsRecord } from '@cloudflare-bot/shared';
import { MenuCallbacks } from '../../../../menus/main.menu';
import { getFieldsForType } from '../../edit-dns.config';

export class EditMenuWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_menu';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const record = state.getEffectiveRecord();
        const fields = getFieldsForType(record.type);

        // Build Message
        const showChange = (label: string, original: any, current: any) => {
            if (String(original) !== String(current)) {
                return `🔹 <b>${label}:</b> ${original} ➝ <b>${current}</b>\n`;
            }
            return `🔹 <b>${label}:</b> ${current}\n`;
        };

        let message = `✏️ <b>Editing Record</b>: ${record.name} (${record.type})\n\n`;

        // Generate status display dynamically based on what fields are available
        for (const field of fields) {
            let currentValue: any = record;
            let originalValue: any = state.originalRecord;

            // Resolve nested path
            if (field.path) {
                for (const key of field.path) {
                    currentValue = currentValue ? currentValue[key] : undefined;
                    originalValue = originalValue ? originalValue[key] : undefined;
                }
            } else {
                currentValue = (record as any)[field.key];
                originalValue = (originalValue as any)[field.key];
            }

            // Remove the emoji and space safely (assuming "Emoji Space Name" format)
            // Using array spread to split by code points or just keeping the original label if it fails?
            // Simple approach: split by space and take the rest.
            const cleanLabel = field.label.includes(' ') ? field.label.split(' ').slice(1).join(' ') : field.label;

            message += showChange(cleanLabel, originalValue, currentValue);
        }

        message += `\n👇 Select a field to edit:`;

        // Build Keyboard
        const keyboard = new InlineKeyboard();
        let rowCount = 0;

        for (const field of fields) {
            keyboard.text(field.label, `edit:${field.key}`);
            rowCount++;
            if (rowCount % 2 === 0) keyboard.row();
        }
        if (rowCount % 2 !== 0) keyboard.row(); // Ensure new row if odd

        keyboard.text('💾 Save Changes', 'edit:save').text('❌ Cancel', 'edit:cancel');

        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

        const callback = await conversation.waitForCallbackQuery(/^edit:/);
        await callback.answerCallbackQuery();

        const action = callback.callbackQuery.data.split(':')[1];

        if (action === 'save') return new JumpToStepResult('save_changes');
        if (action === 'cancel') {
            await ctx.reply('❌ Edit cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return new ExitFlowResult();
        }

        // Find the field definition
        const selectedField = fields.find(f => f.key === action);
        if (selectedField) {
            // Set active field for generic step usage
            state.setActiveField(selectedField);

            // If field has custom step, jump there, otherwise use generic
            if (selectedField.stepId) {
                return new JumpToStepResult(selectedField.stepId);
            } else {
                return new JumpToStepResult('edit_generic_field');
            }
        }

        return new JumpToStepResult('edit_menu'); // Loop back on unknown
    }
}
