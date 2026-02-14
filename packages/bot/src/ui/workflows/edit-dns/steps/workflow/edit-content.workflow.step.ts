import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';

export class EditContentWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_content';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const effectiveRecord = state.getEffectiveRecord();

        if (effectiveRecord.type === 'SRV') {
            await this.handleSrv(conversation, ctx, state, effectiveRecord);
        } else {
            await this.handleStandard(conversation, ctx, state, effectiveRecord);
        }

        return new JumpToStepResult('edit_menu');
    }

    private async handleStandard(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext, record: any) {
        await ctx.reply(`Current Content: ${record.content}\nEnter new content:`);
        const msg = await conversation.waitFor('message:text');
        state.updateModifiedRecord({ content: msg.message.text.trim() } as any);
    }

    private async handleSrv(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext, record: any) {
        const currentData = record.data;

        // 1. Priority
        await ctx.reply(`Current Priority: ${currentData.priority}\nEnter new priority:`);
        const pMsg = await conversation.waitFor('message:text');
        const priority = parseInt(pMsg.message.text.trim());
        if (isNaN(priority)) {
            await ctx.reply('❌ Invalid priority. Edit cancelled.');
            return;
        }

        // 2. Weight
        await ctx.reply(`Current Weight: ${currentData.weight}\nEnter new weight:`);
        const wMsg = await conversation.waitFor('message:text');
        const weight = parseInt(wMsg.message.text.trim());
        if (isNaN(weight)) {
            await ctx.reply('❌ Invalid weight. Edit cancelled.');
            return;
        }

        // 3. Port
        await ctx.reply(`Current Port: ${currentData.port}\nEnter new port:`);
        const poMsg = await conversation.waitFor('message:text');
        const port = parseInt(poMsg.message.text.trim());
        if (isNaN(port)) {
            await ctx.reply('❌ Invalid port. Edit cancelled.');
            return;
        }

        // 4. Target
        await ctx.reply(`Current Target: ${currentData.target}\nEnter new target:`);
        const tMsg = await conversation.waitFor('message:text');
        const target = tMsg.message.text.trim();

        state.updateModifiedRecord({
            data: {
                priority,
                weight,
                port,
                target
            }
        } as any);
    }
}
