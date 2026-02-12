import type { NextFunction, Context } from 'grammy';
import { env } from '../config/env.config';
import { AuthorizationError } from '../core/errors/bot.error';

export async function authGuard(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return next();

  if (chatId !== env.ALLOWED_CHAT_ID) {
    throw new AuthorizationError(ctx.from?.id);
  }

  await next();
}
