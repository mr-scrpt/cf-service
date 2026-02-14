import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer, DnsTtlPayload } from '../../callbacks/callback-data';
import { buildTtlKeyboard } from '../../keyboards/dns.keyboard';
import { ConversationStep } from '../__flow/conversation.step';
import { DnsWizardContext } from '../__flow/dns-wizard.context';

export class SelectTtlStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void> {
        await ctx.reply('TTL:', { reply_markup: buildTtlKeyboard() });
        const ttlC = await conversation.waitForCallbackQuery(CallbackPattern.dnsTtl());
        const { payload } = CallbackSerializer.deserialize<DnsTtlPayload>(ttlC.callbackQuery.data);
        state.ttl = payload.ttl;
        await ttlC.answerCallbackQuery();
    }
}
