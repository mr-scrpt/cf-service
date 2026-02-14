import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';

export interface ConversationStep<TContext = any> {
    execute(conversation: Conversation<any>, ctx: Context, state: TContext): Promise<void>;
}
