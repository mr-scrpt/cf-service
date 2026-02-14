import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { buildProxiedKeyboard } from '../../../../keyboards/dns.keyboard';
import { CallbackPattern, CallbackSerializer, DnsProxiedPayload } from '../../../../callbacks/callback-data';

export class EditProxiedWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = 'edit_proxied';

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        await ctx.reply('Select Proxy Status:', { reply_markup: buildProxiedKeyboard() });

        const callback = await conversation.waitForCallbackQuery(CallbackPattern.dnsProxied());
        const { payload } = CallbackSerializer.deserialize<DnsProxiedPayload>(callback.callbackQuery.data);

        state.updateModifiedRecord({ proxied: payload.value });
        await callback.answerCallbackQuery();

        return new JumpToStepResult('edit_menu');
    }
}
