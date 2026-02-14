import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { ConversationStep } from '../__flow/conversation.step';
import { DnsWizardContext } from '../__flow/dns-wizard.context';
import { DnsHandlerFactory } from '../../workflows/common/handlers/handler.factory';

export class CollectRecordDataStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void> {
        if (!state.type) throw new Error('Record type must be selected before collecting data');

        const handler = DnsHandlerFactory.getHandler(state.type);
        const data = await handler.collectData(conversation, ctx);

        // Map partial data to context fields
        // We cast to any to safely access properties from the discriminated union partial
        // The final validation in DnsWizardContext.validate() ensures correctness
        const payload = data as any;

        if (payload.content !== undefined) state.setContent(payload.content);
        if (payload.data !== undefined) state.setData(payload.data);
        if (payload.priority !== undefined) state.setPriority(payload.priority);
    }
}
