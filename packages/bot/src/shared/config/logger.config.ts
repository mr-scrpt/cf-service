import * as path from 'path';
const { join, dirname } = path;
import { LoggerConfigBuilder, WinstonLoggerAdapter } from '@cloudflare-bot/infrastructure';
import { Environment, LogLevel } from '@cloudflare-bot/shared';
import { BOT_PATHS } from './paths.config';

const LOG_DIR = join(process.cwd(), BOT_PATHS.LOGS);
const LOG_ROTATION = {
  MAX_SIZE: 5242880,
  MAX_FILES: 5,
};

export function createBotLogger(env: string) {
  const level = env === Environment.PRODUCTION ? LogLevel.INFO : LogLevel.DEBUG;
  const consoleEnabled = env !== Environment.PRODUCTION;

  const config = new LoggerConfigBuilder()
    .withServiceName('bot')
    .withLevel(level)
    .addFileTransport(path.join(LOG_DIR, 'error.log'), LogLevel.ERROR, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .addFileTransport(path.join(LOG_DIR, 'combined.log'), undefined, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .enableConsole(consoleEnabled)
    .build();

  return new WinstonLoggerAdapter(config);
}
