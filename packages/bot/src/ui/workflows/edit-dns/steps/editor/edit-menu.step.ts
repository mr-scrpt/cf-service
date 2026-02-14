import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer } from '../../../../callbacks/callback-data';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { EditDnsStep } from '../../config/edit-dns.constants';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { MENU_ACTION_STRATEGIES } from '../../strategies/menu.strategies';
import { buildEditRecordKeyboard, buildEditRecordMessage } from '../../ui/edit-dns.ui';

export class EditMenuWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
  readonly id = EditDnsStep.EDIT_MENU;

  async execute(
    conversation: Conversation<any>,
    ctx: Context,
    state: EditDnsWorkflowContext,
  ): Promise<IStepResult> {
    const record = state.getEffectiveRecord();

    // 1. Build UI
    if (!state.originalRecord) {
      throw new Error('Original record is missing in state');
    }
    const message = buildEditRecordMessage(record, state.originalRecord, state.zoneName);
    const keyboard = buildEditRecordKeyboard(record.type);

    // 2. Send
    await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

    const callback = await conversation.waitForCallbackQuery([
      CallbackPattern.dnsEditField(),
      CallbackPattern.dnsSaveRecord(),
    ]);
    await callback.answerCallbackQuery();

    const data = callback.callbackQuery.data;
    const { type } = CallbackSerializer.deserialize(data);

    const strategy = MENU_ACTION_STRATEGIES[type];
    if (strategy) {
      const result = await strategy.handle(ctx, state, data);
      if (result) return result;
    }

    return new JumpToStepResult(EditDnsStep.EDIT_MENU);
  }
}
