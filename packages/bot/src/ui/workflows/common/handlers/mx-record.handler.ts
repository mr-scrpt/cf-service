import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsRecordInput, DnsRecordType } from '@cloudflare-bot/shared';
import { DnsRecordHandler } from './dns-record.handler';

export class MxRecordHandler implements DnsRecordHandler {
    async collectData(conversation: Conversation<any>, ctx: Context): Promise<Partial<CreateDnsRecordInput>> {
        await ctx.reply('Mail Server (e.g., mail.example.com):');
        const cM = await conversation.waitFor('message:text');
        const content = cM.message.text!.trim();

        await ctx.reply('Priority (0-65535, default 10):');
        const pM = await conversation.waitFor('message:text');
        const priorityInput = pM.message.text!.trim();
        const priority = priorityInput ? parseInt(priorityInput) : 10;

        return { content, priority };
    }
}
