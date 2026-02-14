import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { DnsFieldDefinition } from '../../edit-dns.config';

export class EditGenericFieldWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_generic_field';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const fieldDef = state.getActiveField() as DnsFieldDefinition;

        if (!fieldDef) {
            await ctx.reply('⚠️ Error: No field selected for editing.');
            return new JumpToStepResult('edit_menu');
        }

        const effectiveRecord = state.getEffectiveRecord();

        // Resolve current value
        let currentValue: any = effectiveRecord;
        if (fieldDef.path) {
            for (const key of fieldDef.path) {
                currentValue = currentValue ? currentValue[key] : undefined;
            }
        } else {
            currentValue = (effectiveRecord as any)[fieldDef.key];
        }

        await ctx.reply(
            `Editing <b>${fieldDef.label}</b>\n` +
            `Current Value: <code>${currentValue}</code>\n\n` +
            `Enter new value:`,
            { parse_mode: 'HTML' }
        );

        const msg = await conversation.waitFor('message:text');
        let newValue: any = msg.message.text.trim();

        // Validate/Convert Type
        if (fieldDef.type === 'number') {
            const num = parseFloat(newValue);
            if (isNaN(num)) {
                await ctx.reply('❌ Invalid number. Edit cancelled.');
                return new JumpToStepResult('edit_menu');
            }
            newValue = num;
        } else if (fieldDef.type === 'boolean') {
            // Basic boolean handling if manually entered (though boolean usually uses buttons, this is fallback)
            newValue = newValue.toLowerCase() === 'true' || newValue === '1';
        }

        // Update State
        if (fieldDef.path && fieldDef.path.length > 0) {
            // Nested Update (e.g. data.priority)
            if (fieldDef.path[0] === 'data') {
                // Deep merge required for 'data' property to avoid losing other unrelated fields (like Priority when editing Weight)
                const originalData = (state.originalRecord as any)?.data || {}; // Original data from Cloudflare
                const currentModified = (state.modifiedRecord as any).data || {}; // Modifications made so far

                // Merge: Original -> Modified -> New Change
                const mergedBase = { ...originalData, ...currentModified };

                const fieldKey = fieldDef.path[1]; // e.g. 'priority'
                const newData = { ...mergedBase, [fieldKey]: newValue };

                state.updateModifiedRecord({ data: newData } as any);
            }
        } else {
            // Direct Update
            state.updateModifiedRecord({ [fieldDef.key]: newValue } as any);
        }

        return new JumpToStepResult('edit_menu');
    }
}
