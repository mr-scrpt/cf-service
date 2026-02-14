import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { DnsWizardContext } from './dns-wizard.context';

export interface ConversationStep {
    execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void>;
}
