import type { NextFunction, Context } from 'grammy';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { logger } from '../utils/logger';

export function createUsernameSyncMiddleware(container: DIContainer) {
  const syncUsernameUseCase = container.getSyncUsernameUseCase();

  return async (ctx: Context, next: NextFunction): Promise<void> => {
    const telegramId = ctx.from?.id;
    const username = ctx.from?.username;

    if (telegramId && username) {
      try {
        await syncUsernameUseCase.execute(telegramId, username);
      } catch (error) {
        logger.warn('Username sync failed', {
          telegramId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    await next();
  };
}
