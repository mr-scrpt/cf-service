import {
  createLogger,
  ILogger,
  LoggerMode,
  LoggerLevel,
  Environment,
} from '@cloudflare-bot/shared';
import { env } from '../config/env.config';

export const logger: ILogger = createLogger({
  service: 'telegram-bot',
  mode: env.NODE_ENV === Environment.Production ? LoggerMode.JSON : LoggerMode.Pretty,
  level: env.NODE_ENV === Environment.Production ? LoggerLevel.Info : LoggerLevel.Debug,
  logFile: 'bot.log',
});
