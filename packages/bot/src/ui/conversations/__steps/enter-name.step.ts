import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { ConversationStep } from '../__flow/conversation.step';
import { DnsWizardContext } from '../__flow/dns-wizard.context';

export class EnterNameStep implements ConversationStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void> {
        await ctx.reply('Имя (www, @):');
        const nM = await conversation.waitFor('message:text');
        state.name = nM.message.text!.trim();
    }
}
