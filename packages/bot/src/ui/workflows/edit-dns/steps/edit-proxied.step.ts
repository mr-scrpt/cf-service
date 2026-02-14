import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { EditDnsState } from '../edit-dns.context';

export class EditProxiedStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsState): Promise<void> {
        const current = state.getEffectiveRecord().proxied;
        const newValue = !current;
        state.modifiedRecord.proxied = newValue;

        // Auto-reply to confirm flip, though menu will show it too.
        // await ctx.reply(`Proxy status changed to: ${newValue ? 'Proxied ☁️' : 'DNS Only 🛡'}`);
    }
}
