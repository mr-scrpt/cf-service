import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { EditDnsState } from '../edit-dns.context';

export class EditTtlStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsState): Promise<void> {
        const currentCheck = state.getEffectiveRecord();
        await ctx.reply(`Current TTL: ${currentCheck.ttl}\nEnter new TTL (1 = Auto, or seconds):`);

        while (true) {
            const msg = await conversation.waitFor('message:text');
            const ttl = parseInt(msg.message.text.trim());

            if (!isNaN(ttl) && ttl >= 0) {
                state.modifiedRecord.ttl = ttl;
                break;
            }
            await ctx.reply('❌ Invalid TTL. Please enter a number (e.g. 1, 3600):');
        }
    }
}
