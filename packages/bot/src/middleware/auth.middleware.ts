import type { NextFunction, Context } from 'grammy';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import { AuthorizationError } from '../core/errors/bot.error';

export async function authGuard(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  
  logger.debug('authGuard check', { 
    chatId, 
    userId,
    allowed_chat_id: env.ALLOWED_CHAT_ID 
  });
  
  if (!chatId) {
    logger.debug('No chatId, skipping auth check');
    return next();
  }

  if (chatId !== env.ALLOWED_CHAT_ID) {
    logger.warn('Unauthorized access attempt', { 
      chatId, 
      userId, 
      allowed_chat_id: env.ALLOWED_CHAT_ID 
    });
    throw new AuthorizationError(userId);
  }

  logger.debug('Auth check passed');
  await next();
}
