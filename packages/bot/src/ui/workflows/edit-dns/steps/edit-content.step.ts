import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { EditDnsState } from '../edit-dns.context';

export class EditContentStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsState): Promise<void> {
        const effectiveRecord = state.getEffectiveRecord();

        if (effectiveRecord.type === 'SRV') {
            // SRV Editing Logic
            const currentData = effectiveRecord.data;

            // 1. Priority
            await ctx.reply(`Current Priority: ${currentData.priority}\nEnter new priority:`);
            const pMsg = await conversation.waitFor('message:text');
            const priority = parseInt(pMsg.message.text.trim());
            if (isNaN(priority)) {
                await ctx.reply('❌ Invalid priority. Edit cancelled.');
                return;
            }

            // 2. Weight
            await ctx.reply(`Current Weight: ${currentData.weight}\nEnter new weight:`);
            const wMsg = await conversation.waitFor('message:text');
            const weight = parseInt(wMsg.message.text.trim());
            if (isNaN(weight)) {
                await ctx.reply('❌ Invalid weight. Edit cancelled.');
                return;
            }

            // 3. Port
            await ctx.reply(`Current Port: ${currentData.port}\nEnter new port:`);
            const poMsg = await conversation.waitFor('message:text');
            const port = parseInt(poMsg.message.text.trim());
            if (isNaN(port)) {
                await ctx.reply('❌ Invalid port. Edit cancelled.');
                return;
            }

            // 4. Target
            await ctx.reply(`Current Target: ${currentData.target}\nEnter new target:`);
            const tMsg = await conversation.waitFor('message:text');
            const target = tMsg.message.text.trim();

            // Update state
            // we cast to any because TS might complain about partial updates on union types
            state.modifiedRecord = {
                ...state.modifiedRecord,
                data: {
                    priority,
                    weight,
                    port,
                    target
                }
            } as any;
            return;
        }

        // Standard Content Editing (A, CNAME, TXT, etc.)
        await ctx.reply(`Current Content: ${effectiveRecord.content}\nEnter new content:`);
        const msg = await conversation.waitFor('message:text');

        // Safe update for content
        state.modifiedRecord = {
            ...state.modifiedRecord,
            content: msg.message.text.trim()
        } as any;
    }
}
