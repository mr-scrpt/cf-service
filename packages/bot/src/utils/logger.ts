import {
  LoggerAdapter,
  LoggerPort,
  LoggerMode,
  LoggerLevel,
  Environment,
} from '@cloudflare-bot/shared';
import { env } from '../config/env.config';
import { resolve } from 'path';

// Logs directory at project root
const LOG_DIR = resolve(process.cwd(), 'logs');

export const logger: LoggerPort = new LoggerAdapter({
  service: 'telegram-bot',
  mode: env.NODE_ENV === Environment.Production ? LoggerMode.JSON : LoggerMode.Pretty,
  level: env.NODE_ENV === Environment.Production ? LoggerLevel.Info : LoggerLevel.Debug,
  logDir: LOG_DIR,
  filename: 'bot',
});
