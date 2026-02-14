import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsRecordInput } from '@cloudflare-bot/shared';
import { DnsRecordHandler } from './dns-record.handler';

export class SrvRecordHandler implements DnsRecordHandler {
    async collectData(conversation: Conversation<any>, ctx: Context): Promise<Partial<CreateDnsRecordInput>> {
        await ctx.reply('Target (e.g., sip.example.com):');
        const tM = await conversation.waitFor('message:text');
        const target = tM.message.text!.trim();

        await ctx.reply('Port (0-65535):');
        const poM = await conversation.waitFor('message:text');
        const port = parseInt(poM.message.text!.trim());

        await ctx.reply('Priority (0-65535, default 10):');
        const prM = await conversation.waitFor('message:text');
        const prInput = prM.message.text!.trim();
        const priority = prInput ? parseInt(prInput) : 10;

        await ctx.reply('Weight (0-65535, default 5):');
        const wM = await conversation.waitFor('message:text');
        const wInput = wM.message.text!.trim();
        const weight = wInput ? parseInt(wInput) : 5;

        // Correct structure for SRV record schema
        return {
            data: {
                priority,
                weight,
                port,
                target
            }
        };
    }
}
