import { Bot, type Context } from 'grammy';
import { conversations, type ConversationFlavor } from '@grammyjs/conversations';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { authGuard } from './middleware/auth.middleware';
import { setupErrorHandler } from './utils/error-handler';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { CloudflareGatewayAdapter } from '@cloudflare-bot/shared';
import { registerUiHandlers, registerConversations } from './ui/integration/ui-handlers';

import { CommandModule } from './commands/base/command.module';
import { MenuHandler } from './ui/menus/menu.handler';

type BotContext = Context & ConversationFlavor<Context>;
const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

// Инициализируем Cloudflare Gateway
const cloudflareGateway = new CloudflareGatewayAdapter(env);

bot.use(requestLoggerMiddleware);
bot.use(authGuard);

// Подключаем conversations plugin
bot.use(conversations());

// Регистрируем conversations
registerConversations(bot, cloudflareGateway);

// Регистрируем UI handlers
registerUiHandlers(bot, cloudflareGateway);

bot.api.getMe().then((me) => {
  logger.info(`Bot started as @${me.username}`);
  logger.info(`Admin ID: ${env.ALLOWED_CHAT_ID}`);
});

setupErrorHandler(bot);

// Initialize Command Module
const commandModule = new CommandModule<BotContext>(cloudflareGateway);
commandModule.getRegistry().setupBot(bot);

// Initialize Menu Handler
const menuHandler = new MenuHandler();
bot.on('callback_query:data', (ctx) => menuHandler.handle(ctx));

bot.start({
  onStart: () => logger.info('Bot is running uses Shared Logger...'),
});

const stop = (signal: string) => {
  logger.info(`Stopping bot... (${signal})`);
  bot.stop();
};
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
