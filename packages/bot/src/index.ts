import { Bot, Context, SessionFlavor } from 'grammy';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { authGuard } from './middleware/auth.middleware';
import { requestLoggerMiddleware } from './middleware/request-logger.middleware';
import { createUsernameSyncMiddleware } from './middleware/username-sync.middleware';
import { CloudflareGatewayAdapter } from '@cloudflare-bot/shared';
import { DIContainer, loadConfig } from '@cloudflare-bot/infrastructure';
import { CommandModule } from './commands/base/command.module';
import { bootstrapBot } from './bootstrap';
import { SessionData } from './types';
import { TelegramErrorFormatter } from './core/errors/telegram.formatter';
import { createBotLogger } from './config/logger.config';

type BotContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<BotContext>(env.TELEGRAM_BOT_TOKEN);

const config = loadConfig();
const botLogger = createBotLogger(config.NODE_ENV);
const container = new DIContainer(config, botLogger);

const cloudflareGateway = new CloudflareGatewayAdapter(env);

bootstrapBot(bot, cloudflareGateway);

bot.use(requestLoggerMiddleware);
bot.use(authGuard);
bot.use(createUsernameSyncMiddleware(container));

const commandModule = new CommandModule<BotContext>(cloudflareGateway);
commandModule.getRegistry().setupBot(bot);

bot.api.getMe().then((me) => {
  logger.info('Bot started', { username: me.username, admin_id: env.ALLOWED_CHAT_ID });
});

bot.catch(async (err) => {
  const { ctx, error } = err;
  
  logger.error('Unhandled bot error', { 
    error: error instanceof Error ? error.message : String(error), 
    stack: error instanceof Error ? error.stack : undefined,
    chat_id: ctx?.chat?.id,
    user_id: ctx?.from?.id,
  });

  if (ctx) {
    try {
      const errorMessage = TelegramErrorFormatter.format(error instanceof Error ? error : new Error(String(error)));
      await ctx.reply(errorMessage, { parse_mode: 'HTML' });
    } catch (replyError) {
      logger.error('Failed to send error message', { error: replyError });
      try {
        await ctx.reply('❌ An unexpected error occurred. Please try again later.');
      } catch {}
    }
  }
});

bot.start({
  onStart: () => logger.info('🚀 Cloudflare Management Bot is running with new architecture...'),
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  bot.stop();
  process.exit(1);
});

const stop = (signal: string) => {
  console.log(`Stopping bot... (${signal})`);
  bot.stop();
};
process.once('SIGINT', () => stop('SIGINT'));
process.once('SIGTERM', () => stop('SIGTERM'));
