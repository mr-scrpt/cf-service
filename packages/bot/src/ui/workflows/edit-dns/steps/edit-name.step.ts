import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { EditDnsState } from '../edit-dns.context';
// import { ConversationStep } from '../../../common/interfaces/conversation-step.interface'; // Assuming this exists or I define generic

export class EditNameStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsState): Promise<void> {
        const currentCheck = state.getEffectiveRecord();
        await ctx.reply(
            `Current Name: <b>${currentCheck.name}</b>\n` +
            `Enter new name. \n` +
            `💡 <i>Tip: Enter the full domain name (e.g., <code>api.example.com</code>) or <code>@</code> for root.</i>`,
            { parse_mode: 'HTML' }
        );
        const msg = await conversation.waitFor('message:text');
        state.modifiedRecord.name = msg.message.text.trim();
    }
}
