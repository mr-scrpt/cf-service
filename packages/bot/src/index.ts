import { Bot } from 'grammy';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { authGuard } from './middleware/auth.middleware';
import { setupErrorHandler } from './utils/error-handler';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

bot.use(requestLoggerMiddleware);
bot.use(authGuard);

bot.api.getMe().then((me) => {
  logger.info(`Bot started as @${me.username}`);
  logger.info(`Admin ID: ${env.ALLOWED_CHAT_ID}`);
});

setupErrorHandler(bot);

bot.command('start', (ctx) => ctx.reply('👋 Hello!'));

bot.start({
  onStart: () => logger.info('Bot is running uses Shared Logger...'),
});

const stop = (signal: string) => {
  logger.info(`Stopping bot... (${signal})`);
  bot.stop();
};
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
