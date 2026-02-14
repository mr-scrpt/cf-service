import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { buildTtlKeyboard } from '../../../../keyboards/dns.keyboard';
import { CallbackPattern, CallbackSerializer, DnsTtlPayload } from '../../../../callbacks/callback-data';

export class EditTtlWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_ttl';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        await ctx.reply('Select TTL:', { reply_markup: buildTtlKeyboard() });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsTtl());
        const { payload } = CallbackSerializer.deserialize<DnsTtlPayload>(callback.callbackQuery.data);

        state.updateModifiedRecord({ ttl: payload.ttl });
        await callback.answerCallbackQuery();

        return new JumpToStepResult('edit_menu');
    }
}
