import type { NextFunction, Context } from 'grammy';
import { InlineKeyboard } from 'grammy';
import { env } from '@shared/config/env.config';
import { logger } from '@shared/utils/logger';
import { DIContainer } from '@cloudflare-bot/infrastructure';

let container: DIContainer;

export function initAuthGuard(diContainer: DIContainer) {
  container = diContainer;
}

export async function authGuard(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name || '';
  const lastName = ctx.from?.last_name;
  
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

  if (chatId === env.ALLOWED_CHAT_ID) {
    logger.debug('Auth check passed - admin user');
    await next();
    return;
  }

  if (!userId) {
    logger.warn('Missing userId in auth check');
    return;
  }

  const checkAccessUseCase = container.getCheckUserAccessUseCase();
  const hasAccess = await checkAccessUseCase.execute(userId);

  if (hasAccess) {
    logger.debug('Auth check passed - user has access', { userId, username });
    await next();
    return;
  }

  const registrationRepo = container.getRegistrationRequestRepository();
  const pendingRequest = await registrationRepo.findPendingByTelegramId(userId);

  if (pendingRequest) {
    await ctx.reply(
      '⏳ <b>Access Pending</b>\n\n' +
      'Your access request is pending admin approval.\n\n' +
      'Please wait for confirmation.',
      { parse_mode: 'HTML' }
    );
    return;
  }

  const keyboard = new InlineKeyboard()
    .text('📝 Request Access', 'request_access');

  await ctx.reply(
    '🔒 <b>Access Required</b>\n\n' +
    'You need approval to use this bot.\n\n' +
    'Click the button below to request access.',
    { 
      parse_mode: 'HTML',
      reply_markup: keyboard 
    }
  );
}
