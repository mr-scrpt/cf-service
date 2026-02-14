import { LoggerAdapter, LoggerMode, LoggerLevel, Environment } from '@cloudflare-bot/shared';
import { env } from '../config/env.config';
import { resolve } from 'path';

const LOG_DIR = resolve(process.cwd(), 'logs');

export const logger = new LoggerAdapter({
  service: 'cloudflare-bot',
  mode: env.NODE_ENV === Environment.Production ? LoggerMode.JSON : LoggerMode.Pretty,
  level: LoggerLevel.Debug,
  logDir: LOG_DIR,
  filename: 'bot',
});
