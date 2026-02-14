import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsRecordInput } from '@cloudflare-bot/shared';
import { DnsRecordHandler } from './dns-record.handler';

export class StandardRecordHandler implements DnsRecordHandler {
    async collectData(conversation: Conversation<any>, ctx: Context): Promise<Partial<CreateDnsRecordInput>> {
        await ctx.reply('Значение (IP/домен):');
        const cM = await conversation.waitFor('message:text');
        const content = cM.message.text!.trim();

        return { content };
    }
}
