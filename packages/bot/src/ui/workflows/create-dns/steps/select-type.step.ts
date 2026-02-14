import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer, DnsTypePayload } from '../../../callbacks/callback-data';
import { buildDnsTypeKeyboard } from '../../../keyboards/dns.keyboard';
import { ConversationStep } from '../../common/interfaces/conversation-step.interface';
import { CreateDnsContext } from '../create-dns.context';

export class SelectTypeStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsContext): Promise<void> {
        await ctx.reply('Тип:', { reply_markup: buildDnsTypeKeyboard() });
        const tC = await conversation.waitForCallbackQuery(CallbackPattern.dnsType());
        const { payload } = CallbackSerializer.deserialize<DnsTypePayload>(tC.callbackQuery.data);
        state.setType(payload.recordType);
        await tC.answerCallbackQuery();
    }
}
