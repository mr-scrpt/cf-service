import type { Context, Bot } from 'grammy';
import { Environment } from '@cloudflare-bot/shared';
import { env } from '../config/env.config';
import { BotError, AuthorizationError } from '../core/errors/bot.error';
import { logger } from './logger';

export function setupErrorHandler(bot: Bot<Context>) {
  bot.catch((err) => {
    const ctx = err.ctx;
    const error = err.error;

    const errorMeta = {
      user_id: ctx.from?.id,
      update_id: ctx.update.update_id,
      code: error instanceof BotError ? error.code : 'UNKNOWN_ERROR',
      meta: error instanceof BotError ? error.meta : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    };

    logger.error(
      `Error handling update: ${error instanceof Error ? error.message : String(error)}`,
      errorMeta,
    );

    if (error instanceof AuthorizationError) {
      ctx.reply('⛔ <b>Access Denied</b>', { parse_mode: 'HTML' }).catch(() => {});
      return;
    }

    if (env.NODE_ENV === Environment.Development && ctx.chat?.id) {
      ctx
        .reply(`⚠️ Internal Error: ${error instanceof Error ? error.message : String(error)}`)
        .catch(() => {});
    }
  });
}
