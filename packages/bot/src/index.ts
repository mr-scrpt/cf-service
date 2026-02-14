import { Bot, Context, SessionFlavor } from 'grammy';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { authGuard } from './middleware/auth.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { CloudflareGatewayAdapter } from '@cloudflare-bot/shared';
import { CommandModule } from './commands/base/command.module';
import { bootstrapBot } from './bootstrap';
import { SessionData } from './types';

type BotContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

const cloudflareGateway = new CloudflareGatewayAdapter(env);

bootstrapBot(bot, cloudflareGateway);

bot.use(requestLoggerMiddleware);
bot.use(authGuard);

const commandModule = new CommandModule<BotContext>(cloudflareGateway);
commandModule.getRegistry().setupBot(bot);

bot.api.getMe().then((me) => {
  logger.info('Bot started', { username: me.username, admin_id: env.ALLOWED_CHAT_ID });
});

bot.catch((err) => {
  logger.error('Bot error', { error: err.message, stack: err.stack });
});

bot.start({
  onStart: () => logger.info('🚀 Cloudflare Management Bot is running with new architecture...'),
});

const stop = (signal: string) => {
  console.log(`Stopping bot... (${signal})`);
  bot.stop();
};
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
