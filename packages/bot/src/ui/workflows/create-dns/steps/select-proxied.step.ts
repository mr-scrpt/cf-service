import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { isProxiable } from '@cloudflare-bot/shared';
import { CallbackPattern, CallbackSerializer, DnsProxiedPayload } from '../../../callbacks/callback-data';
import { buildProxiedKeyboard } from '../../../keyboards/dns.keyboard';
import { ConversationStep } from '../../common/interfaces/conversation-step.interface';
import { CreateDnsContext } from '../create-dns.context';

export class SelectProxiedStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsContext): Promise<void> {
        if (state.type && isProxiable(state.type)) {
            await ctx.reply('Proxied?', { reply_markup: buildProxiedKeyboard() });
            const pC = await conversation.waitForCallbackQuery(CallbackPattern.dnsProxied());
            const { payload } = CallbackSerializer.deserialize<DnsProxiedPayload>(pC.callbackQuery.data);
            state.setProxied(payload.value);
            await pC.answerCallbackQuery();
        } else {
            state.setProxied(false);
        }
    }
}
