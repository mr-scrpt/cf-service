import type { NextFunction, Context } from 'grammy';
import {
  LoggerAdapter,
  LoggerMode,
  LoggerLevel,
  Environment,
} from '@cloudflare-bot/shared';
import { env } from '../../shared/config/env.config';
import { resolve } from 'path';

const LOG_DIR = resolve(process.cwd(), 'logs');

// Dedicated logger for Telegram requests
const requestLogger = new LoggerAdapter({
  service: 'telegram-requests',
  mode: env.NODE_ENV === Environment.PRODUCTION ? LoggerMode.JSON : LoggerMode.Pretty,
  level: env.NODE_ENV === Environment.PRODUCTION ? LoggerLevel.Info : LoggerLevel.Debug,
  logDir: LOG_DIR,
  filename: 'requests',
});

export async function requestLoggerMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  requestLogger.info(`Processed update ${ctx.update.update_id}`, {
    duration_ms: ms,
    user_id: ctx.from?.id,
  });
}
