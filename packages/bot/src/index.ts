import { Bot, type Context } from 'grammy';
import { conversations, type ConversationFlavor } from '@grammyjs/conversations';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { authGuard } from './middleware/auth.middleware';
import { setupErrorHandler } from './utils/error-handler';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { CloudflareGatewayAdapter } from '@cloudflare-bot/shared';
import { registerUiHandlers, registerConversations } from './ui/integration/ui-handlers';

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

bot.command('start', (ctx) =>
  ctx.reply(
    '👋 Привет! Я бот для управления Cloudflare DNS.\n\n' +
    'Доступные команды:\n' +
    '/dns - Управление DNS записями\n' +
    '/domain - Управление доменами'
  )
);

bot.start({
  onStart: () => logger.info('Bot is running uses Shared Logger...'),
});

const stop = (signal: string) => {
  logger.info(`Stopping bot... (${signal})`);
  bot.stop();
};
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
