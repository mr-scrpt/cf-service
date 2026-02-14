import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { isProxiable } from '@cloudflare-bot/shared';
import { CallbackPattern, CallbackSerializer, DnsProxiedPayload } from '../../callbacks/callback-data';
import { buildProxiedKeyboard } from '../../keyboards/dns.keyboard';
import { ConversationStep } from '../__flow/conversation.step';
import { DnsWizardContext } from '../__flow/dns-wizard.context';

export class SelectProxiedStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void> {
        if (state.type && isProxiable(state.type)) {
            await ctx.reply('Proxied?', { reply_markup: buildProxiedKeyboard() });
            const pC = await conversation.waitForCallbackQuery(CallbackPattern.dnsProxied());
            const { payload } = CallbackSerializer.deserialize<DnsProxiedPayload>(pC.callbackQuery.data);
            state.proxied = payload.value;
            await pC.answerCallbackQuery();
        } else {
            state.proxied = false;
        }
    }
}
