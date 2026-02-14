import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult, ExitFlowResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { MenuCallbacks } from '../../../../menus/main.menu';
import { logger } from '../../../../../utils/logger';
import { ErrorMapper } from '../../../../../core/errors/error-mapper';
import { EditDnsStep } from '../../config/edit-dns.constants';

export class SaveRecordWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = EditDnsStep.SAVE_CHANGES;

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

        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));

            logger.error('Error updating DNS record', {
                error: err.message,
                stack: err.stack,
                recordId: state.recordId,
                zoneId: state.zoneId
            });

            // Use ErrorMapper to get a user-friendly message based on error codes (Shared Errors)
            const userMessage = ErrorMapper.toUserMessage(err);

            await ctx.reply(userMessage, {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
        }

        return new ExitFlowResult();
    }
}
