import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { CreateDnsRecordInput } from '@cloudflare-bot/shared';

export interface DnsRecordHandler {
    collectData(conversation: Conversation<any>, ctx: Context): Promise<Partial<CreateDnsRecordInput>>;
}
