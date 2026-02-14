import type { Context, Bot } from 'grammy';
import { AppError } from '@cloudflare-bot/shared';
import { Environment } from '@cloudflare-bot/shared';
import { env } from '../config/env.config';
import { ErrorMapper } from '../core/errors/bot.error';
import { logger } from './logger';

/**
 * Global error handler for Grammy bot
 * Catches all unhandled errors and provides consistent logging and user feedback
 */
export function setupErrorHandler<C extends Context>(bot: Bot<C>) {
  bot.catch((err) => {
    const ctx = err.ctx;
    const error = err.error;

    // Log error with metadata
    const errorMeta = {
      user_id: ctx.from?.id,
      update_id: ctx.update.update_id,
      chat_id: ctx.chat?.id,
      code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
      meta: error instanceof AppError ? error.meta : undefined,
      stack: env.NODE_ENV === Environment.Development ? error instanceof Error ? error.stack : undefined : undefined,
    };

    logger.error(
      `Error handling update: ${error instanceof Error ? error.message : String(error)}`,
      errorMeta,
    );

    // Send user-friendly message using ErrorMapper
    const userMessage = ErrorMapper.toUserMessage(error instanceof Error ? error : new Error(String(error)));

    ctx.reply(userMessage, { parse_mode: 'HTML' }).catch((replyError) => {
      // If reply fails, log it but don't throw
      logger.error('Failed to send error message to user', {
        originalError: error instanceof Error ? error.message : String(error),
        replyError: replyError instanceof Error ? replyError.message : String(replyError),
        user_id: ctx.from?.id,
      });
    });
  });
}
