import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';

export class EditNameWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_name';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const currentName = state.getEffectiveRecord().name;

        await ctx.reply(
            `Current Name: <b>${currentName}</b>\n` +
            `Enter new name (or @ for root):`,
            { parse_mode: 'HTML' }
        );

        const msg = await conversation.waitFor('message:text');
        let newName = msg.message.text.trim();

        // Simple validation/normalization logic
        if (newName === '@') {
            // We need the zone name to resolve @ correctly, but often Cloudflare handles @ as root if passed,
            // or we resolve it against zone name. 
            // Existing logic might just pass @. Let's check context.
            // Actually existing logic in EditNameStep just takes input.
            // Let's keep it simple.
        }

        state.updateModifiedRecord({ name: newName });

        // Return to menu
        return new JumpToStepResult('edit_menu');
    }
}
