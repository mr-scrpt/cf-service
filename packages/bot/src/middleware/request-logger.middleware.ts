import type { NextFunction, Context } from 'grammy';
import { logger } from '../utils/logger';

export async function requestLogger(ctx: Context, next: NextFunction): Promise<void> {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  logger.info(`Processed update ${ctx.update.update_id}`, {
    duration_ms: ms,
    user_id: ctx.from?.id,
  });
}
