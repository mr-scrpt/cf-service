import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../core/workflow.step';
import { IStepResult, NextStepResult, ExitFlowResult } from '../../core/step.result';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { SelectRecordPaginationStep } from '../../delete-dns/steps/select-record-pagination.step';
import { MenuCallbacks } from '../../../menus/main.menu';
import { EditDnsStep } from '../edit-dns.constants';

export class SelectRecordWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = EditDnsStep.SELECT_RECORD;

    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        // Reuse existing pagination logic via composition
        // We need to adapt the state to match what SelectRecordPaginationStep expects (ZoneAwareState)
        // EditDnsWorkflowContext matches { zoneId?: string }

        const legacyStep = new SelectRecordPaginationStep(this.gateway);
        // We can pass our state because it has zoneId
        const record = await legacyStep.execute(conversation, ctx, state);

        if (!record) {
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return new ExitFlowResult();
        }

        state.setRecord(record);
        return new NextStepResult();
    }
}
