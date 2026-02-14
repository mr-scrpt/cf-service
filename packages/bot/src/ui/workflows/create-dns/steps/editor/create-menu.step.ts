import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer } from '../../../../callbacks/callback-data';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { buildCreateRecordMessage, buildCreateRecordKeyboard } from '../../ui/create-dns.ui';
import { CreateDnsStep } from '../../config/create-dns.constants';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';
import { MENU_ACTION_STRATEGIES } from '../../strategies/menu.strategies';

export class CreateMenuWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
    readonly id = CreateDnsStep.CREATE_MENU;

    async execute(
        conversation: Conversation<any>,
        ctx: Context,
        state: CreateDnsWorkflowContext,
    ): Promise<IStepResult> {
        // 1. Build UI
        if (!state.type) {
            throw new Error('Record type is missing in state');
        }

        const draft = state.getEffectiveRecord();
        const message = buildCreateRecordMessage(draft, state.zoneName);
        const keyboard = buildCreateRecordKeyboard(state.type);

        // 2. Send
        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

        // 3. Wait for Action (Edit Field or Create/Cancel)
        // Note: Generic Save button is used for 'Create', and Cancel button is also using SaveRecord pattern with 'cancel' action in payload.
        const callback = await conversation.waitForCallbackQuery([
            CallbackPattern.dnsEditField(),
            CallbackPattern.dnsSaveRecord()
        ]);
        await callback.answerCallbackQuery();

        const data = callback.callbackQuery.data;

        let actionStr = 'noop';
        if (CallbackPattern.dnsEditField().test(data)) {
            actionStr = 'set'; // Matches CreateDnsAction.SET
        } else if (CallbackPattern.dnsSaveRecord().test(data)) {
            const p = CallbackSerializer.deserialize<any>(data).payload;
            if (p.action === 'save') actionStr = 'create'; // Matches CreateDnsAction.CREATE
            else if (p.action === 'cancel') actionStr = 'cancel'; // Matches CreateDnsAction.CANCEL
        }

        const strategy = MENU_ACTION_STRATEGIES[actionStr];
        if (strategy) {
            const result = await strategy.handle(ctx, state, data);
            if (result) return result;
        }

        return new JumpToStepResult(CreateDnsStep.CREATE_MENU);
    }

}
