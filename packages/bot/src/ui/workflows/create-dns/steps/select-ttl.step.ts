import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CallbackPattern, CallbackSerializer, DnsTtlPayload } from '../../../callbacks/callback-data';
import { buildTtlKeyboard } from '../../../keyboards/dns.keyboard';
import { ConversationStep } from '../../../conversations/__flow/conversation.step';
import { CreateDnsContext } from '../create-dns.context';

export class SelectTtlStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsContext): Promise<void> {
        await ctx.reply('TTL:', { reply_markup: buildTtlKeyboard() });
        const ttlC = await conversation.waitForCallbackQuery(CallbackPattern.dnsTtl());
        const { payload } = CallbackSerializer.deserialize<DnsTtlPayload>(ttlC.callbackQuery.data);
        state.setTtl(payload.ttl);
        await ttlC.answerCallbackQuery();
    }
}
