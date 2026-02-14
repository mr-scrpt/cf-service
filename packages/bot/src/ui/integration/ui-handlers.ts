import type { Context } from 'grammy';
import type { ConversationFlavor } from '@grammyjs/conversations';
import { createConversation } from '@grammyjs/conversations';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { createDnsConversationFactory } from '../conversations/create-dns.conversation';
import { registerDomainConversationFactory } from '../conversations/register-domain.conversation';
import { deleteDnsFlowFactory } from '../workflows/delete-dns/delete-dns.flow';
import { Callback } from '../callbacks/callback-data';
import { InlineKeyboard } from 'grammy';

type MyContext = Context & ConversationFlavor<Context>;

/**
 * Регистрирует UI handlers для inline keyboards
 */
export function registerUiHandlers(bot: any, gateway: DnsGatewayPort) {
    // Главное меню для DNS
    bot.command('dns', async (ctx: MyContext) => {
        const kb = new InlineKeyboard()
            .text('➕ Создать DNS запись', 'start_create_dns')
            .row()
            .text('📋 Список записей', 'list_dns')
            .row();

        await ctx.reply('🌐 Управление DNS записями:', { reply_markup: kb });
    });

    // Callback для запуска conversation создания DNS
    bot.callbackQuery('start_create_dns', async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('createDns');
    });

    // Callback для списка DNS записей (TODO: реализовать)
    bot.callbackQuery('list_dns', async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.reply('📋 Список DNS записей пока не реализован. Используйте "Создать DNS запись".');
    });

    // Главное меню для доменов
    bot.command('domain', async (ctx: MyContext) => {
        const kb = new InlineKeyboard()
            .text('➕ Зарегистрировать домен', 'start_register_domain')
            .row()
            .text('📋 Список доменов', 'list_domains')
            .row();

        await ctx.reply('🌍 Управление доменами:', { reply_markup: kb });
    });

    // Callback для запуска conversation регистрации домена
    bot.callbackQuery('start_register_domain', async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.conversation.enter('registerDomain');
    });

    // Callback для списка доменов (TODO: реализовать)
    bot.callbackQuery('list_domains', async (ctx: MyContext) => {
        await ctx.answerCallbackQuery();
        await ctx.reply('📋 Список доменов пока не реализован. Используйте "Зарегистрировать домен".');
    });

    // Обработка отмены
    bot.callbackQuery(Callback.cancel(), async (ctx: MyContext) => {
        await ctx.answerCallbackQuery('Отменено');
        await ctx.reply('❌ Операция отменена');
    });
}

/**
 * Регистрирует conversations в боте
 */
export function registerConversations(
    bot: any,
    gateway: DnsGatewayPort
) {
    // DNS creation conversation - передаём фабрику напрямую
    const createDnsConv = createDnsConversationFactory(gateway);
    bot.use(createConversation(createDnsConv, 'createDns'));

    // Domain registration conversation
    const registerDomainConv = registerDomainConversationFactory(gateway);
    bot.use(createConversation(registerDomainConv, 'registerDomain'));

    // Delete DNS conversation
    const deleteDnsConv = deleteDnsFlowFactory(gateway);
    bot.use(createConversation(deleteDnsConv, 'deleteDns'));
}
