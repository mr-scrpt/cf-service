import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { ConversationStep } from '../../common/interfaces/conversation-step.interface';
import { CreateDnsContext } from '../create-dns.context';

export class EnterNameStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsContext): Promise<void> {
        await ctx.reply('Имя (www, @):');
        const nM = await conversation.waitFor('message:text');
        state.setName(nM.message.text!.trim());
    }
}
