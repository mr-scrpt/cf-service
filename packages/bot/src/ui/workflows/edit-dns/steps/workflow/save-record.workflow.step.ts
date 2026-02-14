import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, ExitFlowResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { MenuCallbacks } from '../../../../menus/main.menu';
import { logger } from '../../../../../utils/logger';

export class SaveRecordWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'save_changes';

    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        try {
            const finalRecord = state.getEffectiveRecord();

            logger.info('Saving DNS record changes', {
                original: state.originalRecord,
                modified: state.modifiedRecord,
                effective: finalRecord
            });

            await conversation.external(() => this.gateway.updateDnsRecord(state.recordId!, state.zoneId!, finalRecord));

            logger.info('DNS record updated successfully', { recordId: state.recordId });
            await ctx.reply('✅ Record updated successfully!', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });

        } catch (e: any) {
            logger.error('Error updating DNS record', {
                error: e.message || String(e),
                recordId: state.recordId,
                zoneId: state.zoneId
            });
            await ctx.reply(`❌ Error updating record: ${e.message || String(e)}`, {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
        }

        return new ExitFlowResult();
    }
}
