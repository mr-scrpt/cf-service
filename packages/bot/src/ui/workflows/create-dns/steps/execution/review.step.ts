import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer } from '../../../../callbacks/callback-data';
import { IStepResult, JumpToStepResult, ExitFlowResult, NextStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { buildCreateRecordMessage } from '../../ui/create-dns.ui'; // We might need a new buildReviewMessage
import { CreateDnsStep, CreateDnsAction } from '../../config/create-dns.constants';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';
import { InlineKeyboard } from 'grammy';
import { Callback } from '../../../../callbacks/callback-data';
import { MenuCallbacks } from '../../../../menus/main.menu';

export class ReviewWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
    readonly id = CreateDnsStep.CREATE_REVIEW;

    async execute(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
    ): Promise<IStepResult> {
        const draft = state.getEffectiveRecord();

        // Reuse buildCreateRecordMessage as it shows the summary of fields
        const message = buildCreateRecordMessage(draft, state.zoneName);

        // Simple keyboard: Create or Cancel
        // (Maybe Edit later)
        const keyboard = new InlineKeyboard()
            .text('✅ Confirm & Create', Callback.dnsSaveRecord()) // Reusing save pattern with action=save
            .text('❌ Cancel', Callback.dnsEditCancel());

        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

        const callback = await conversation.waitForCallbackQuery([
            CallbackPattern.dnsSaveRecord()
        ]);

        const data = callback.callbackQuery.data;
        const p = CallbackSerializer.deserialize<any>(data).payload;

        if (p.action === CreateDnsAction.SAVE) {
            await callback.answerCallbackQuery();
            return new NextStepResult(); // Proceed to CreateRecord
        } else if (p.action === CreateDnsAction.CANCEL) {
            await callback.answerCallbackQuery('Cancelled');
            await ctx.reply('❌ Creation cancelled.', {
                reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: MenuCallbacks.dns }]] }
            });
            return new ExitFlowResult();
        }

        return new JumpToStepResult(CreateDnsStep.CREATE_REVIEW);
    }
}
