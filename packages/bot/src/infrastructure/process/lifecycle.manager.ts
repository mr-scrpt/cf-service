import { Bot, Context, SessionFlavor } from 'grammy';
import { logger } from '@shared/utils/logger';
import { TelegramErrorFormatter } from '@shared/core/errors/telegram.formatter';
import { SessionData } from '@shared/types';

type BotContext = Context & SessionFlavor<SessionData>;

export class LifecycleManager {
  setupErrorHandling(bot: Bot<BotContext>) {
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
          const errorMessage = TelegramErrorFormatter.format(
            error instanceof Error ? error : new Error(String(error))
          );
          await ctx.reply(errorMessage, { parse_mode: 'HTML' });
        } catch (replyError) {
          logger.error('Failed to send error message', { error: replyError });
          try {
            await ctx.reply('❌ An unexpected error occurred. Please try again later.');
          } catch {}
        }
      }
    });
  }

  setupProcessHandlers(bot: Bot<BotContext>) {
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection', { reason, promise });
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
      bot.stop();
      process.exit(1);
    });

    const stop = (signal: string) => {
      logger.info(`Stopping bot... (${signal})`);
      bot.stop();
    };

    process.once('SIGINT', () => stop('SIGINT'));
    process.once('SIGTERM', () => stop('SIGTERM'));
  }
}
