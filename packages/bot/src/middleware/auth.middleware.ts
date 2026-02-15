import type { NextFunction, Context } from 'grammy';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import { AuthorizationError } from '../core/errors/bot.error';

export async function authGuard(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  
  logger.debug('authGuard check', { 
    chatId, 
    userId,
    username,
    allowedChatId: env.ALLOWED_CHAT_ID 
  });
  
  if (!chatId) {
    logger.debug('No chatId, skipping auth check');
    return next();
  }

  if (!username) {
    logger.warn('User without username attempted access', { chatId, userId });
    await ctx.reply(
      '⚠️ <b>Username Required</b>\n\n' +
      'Please set a username in Telegram settings to use this bot.\n\n' +
      '<i>Settings → Edit Profile → Username</i>',
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (chatId !== env.ALLOWED_CHAT_ID) {
    logger.warn('Unauthorized access attempt', { 
      chatId, 
      userId, 
      username,
      allowedChatId: env.ALLOWED_CHAT_ID 
    });
    throw new AuthorizationError(userId);
  }

  logger.debug('Auth check passed');
  await next();
}
