import { Context } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { MENU_DEFINITIONS } from './menu.definitions';
import { MenuResult } from './menu.types';
import { logger } from '../../utils/logger';

type MyContext = Context & ConversationFlavor<Context>;

export class MenuHandler {
    async handle(ctx: MyContext): Promise<void> {
        if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;

        const data = ctx.callbackQuery.data;
        const handler = MENU_DEFINITIONS[data];

        if (!handler) {
            logger.warn(`Unknown menu callback received: ${data}`);
            try { await ctx.answerCallbackQuery('Unknown action or button expired'); } catch { }
            return;
        }

        const result = handler();
        await this.executeResult(ctx, result);
    }

    private async executeResult(ctx: MyContext, result: MenuResult): Promise<void> {
        // Always answer to stop loading animation
        try {
            await ctx.answerCallbackQuery();
        } catch (e) {
            // ignore if already answered
        }

        const handlers: { [K in MenuResult['type']]: (r: Extract<MenuResult, { type: K }>) => Promise<void> } = {
            edit: async (r) => {
                await ctx.editMessageText(r.text, {
                    parse_mode: 'HTML',
                    reply_markup: r.keyboard,
                });
            },
            conversation: async (r) => {
                await ctx.conversation.enter(r.name);
            },
            noop: async (r) => {
                if (r.message) await ctx.reply(r.message);
            }
        };

        const handler = handlers[result.type] as (r: MenuResult) => Promise<void>;
        if (handler) {
            await handler(result);
        }
    }
}
