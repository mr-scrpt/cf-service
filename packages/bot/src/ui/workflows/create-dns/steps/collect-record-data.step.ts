import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { ConversationStep } from '../../../conversations/__flow/conversation.step';
import { CreateDnsContext } from '../create-dns.context';
import { DnsHandlerFactory } from '../../common/handlers/handler.factory';

export class CollectRecordDataStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: CreateDnsContext): Promise<void> {
        if (!state.type) throw new Error('Record type must be selected before collecting data');

        // We reuse the existing handlers strategy from the previous refactor
        const handler = DnsHandlerFactory.getHandler(state.type);
        const data = await handler.collectData(conversation, ctx);

        // Map partial data to context fields
        // We cast to any to safely access properties from the discriminated union partial
        const payload = data as any;

        if (payload.content !== undefined) state.setContent(payload.content);
        if (payload.data !== undefined) state.setData(payload.data);
        if (payload.priority !== undefined) state.setPriority(payload.priority);
    }
}
