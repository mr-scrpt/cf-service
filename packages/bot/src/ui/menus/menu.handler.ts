import { Context, InlineKeyboard } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { MenuCallbacks, buildDnsMenuKeyboard, buildMainMenuKeyboard } from './main.menu';

type MyContext = Context & ConversationFlavor<Context>;

// Discriminated union for declarative actions
type MenuResult =
    | { type: 'edit'; text: string; keyboard: InlineKeyboard }
    | { type: 'conversation'; name: string }
    | { type: 'noop'; message?: string };

export class MenuHandler {
    async handle(ctx: MyContext): Promise<void> {
        if (!ctx.callbackQuery || !ctx.callbackQuery.data) return;

        const data = ctx.callbackQuery.data;

        // Declarative Routing Map
        const routeMap: Record<string, () => MenuResult> = {
            [MenuCallbacks.main]: () => ({
                type: 'edit',
                text: `👋 <b>Welcome to CoolCinema Bot!</b>\n\nI can help you manage your DNS records and Domains easily.\nSelect an option below to get started:`,
                keyboard: buildMainMenuKeyboard()
            }),
            [MenuCallbacks.dns]: () => ({
                type: 'edit',
                text: `🌐 <b>DNS Management</b>\n\nManage your DNS records here. Select an action:`,
                keyboard: buildDnsMenuKeyboard()
            }),
            [MenuCallbacks.createDns]: () => ({
                type: 'conversation',
                name: 'createDns'
            }),
            [MenuCallbacks.domain]: () => ({
                type: 'edit',
                text: `🏰 <b>Domain Management</b>\n\nManage your domains here. Select an action:`,
                keyboard: new InlineKeyboard().text('Coming Soon', 'noop').row().text('🔙 Back', MenuCallbacks.main)
            }),
        };

        const handler = routeMap[data];
        if (handler) {
            const result = handler();
            await this.executeResult(ctx, result);
        } else if (data === 'noop') {
            await ctx.answerCallbackQuery('Coming soon!');
        }
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
