import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { WorkflowStep } from '../../../core/workflow.step';
import { IStepResult, NextStepResult, ExitFlowResult } from '../../../core/step.result';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';
import { CreateDnsStep } from '../../config/create-dns.constants';
import { Callback, CallbackPattern, CallbackSerializer, DnsTypePayload } from '../../../../callbacks/callback-data';
import { DnsRecordType } from '@cloudflare-bot/shared';
import { MenuCallbacks } from '../../../../menus/main.menu';

export class SelectTypeWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
    readonly id = CreateDnsStep.SELECT_TYPE;

    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsWorkflowContext): Promise<IStepResult> {
        const keyboard = new InlineKeyboard()
            .text('A', Callback.dnsType(DnsRecordType.A))
            .text('AAAA', Callback.dnsType(DnsRecordType.AAAA))
            .text('CNAME', Callback.dnsType(DnsRecordType.CNAME))
            .row()
            .text('TXT', Callback.dnsType(DnsRecordType.TXT))
            .text('NS', Callback.dnsType(DnsRecordType.NS))
            .text('MX', Callback.dnsType(DnsRecordType.MX))
            .text('SRV', Callback.dnsType(DnsRecordType.SRV))
            .row()
            .text('❌ Cancel', Callback.cancel());

        await ctx.reply('Select Record Type:', { reply_markup: keyboard });

        const matcher = new RegExp(`^${CallbackPattern.dnsType().source}|^${CallbackPattern.cancel().source}`);
        const callback = await conversation.waitForCallbackQuery(matcher);

        if (CallbackPattern.cancel().test(callback.callbackQuery.data)) {
            await callback.answerCallbackQuery('Canceled');
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: MenuCallbacks.dns }]] }
            });
            return new ExitFlowResult();
        }

        const { payload } = CallbackSerializer.deserialize<DnsTypePayload>(callback.callbackQuery.data);
        state.setType(payload.recordType);

        await callback.answerCallbackQuery();
        return new NextStepResult();
    }
}
