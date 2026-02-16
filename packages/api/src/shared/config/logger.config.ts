import * as path from 'path';
import { LoggerConfigBuilder, WinstonLoggerAdapter } from '@cloudflare-bot/infrastructure';
import { Environment, LogLevel } from '@cloudflare-bot/shared';
import { API_PATHS } from './paths.config';
import type { IApiLogger, RequestLogData, ResponseLogData } from '@shared/types/logger.types';

const LOG_DIR = path.join(process.cwd(), API_PATHS.LOGS);
const LOG_ROTATION = {
  MAX_SIZE: 5242880,
  MAX_FILES: 5,
};

export function createApiLogger(env: string): IApiLogger {
  const level = env === Environment.PRODUCTION ? LogLevel.INFO : LogLevel.DEBUG;
  const consoleEnabled = env !== Environment.PRODUCTION;

  const config = new LoggerConfigBuilder()
    .withServiceName('api')
    .withLevel(level)
    .addFileTransport(path.join(LOG_DIR, 'error.log'), LogLevel.ERROR, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .addFileTransport(path.join(LOG_DIR, 'combined.log'), undefined, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .addFileTransport(path.join(LOG_DIR, 'requests.log'), undefined, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .addFileTransport(path.join(LOG_DIR, 'responses.log'), undefined, LOG_ROTATION.MAX_SIZE, LOG_ROTATION.MAX_FILES)
    .enableConsole(consoleEnabled)
    .build();

  const logger = new WinstonLoggerAdapter(config);

  return Object.assign(logger, {
    logRequest: (data: RequestLogData) => logger.info('HTTP Request', data),
    logResponse: (data: ResponseLogData) => logger.info('HTTP Response', data),
  });
}
