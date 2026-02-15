import winston from 'winston';
import { ILogger } from '@cloudflare-bot/application';
import { LoggerConfig, createWinstonTransports } from './logger-config';

export class WinstonLoggerAdapter implements ILogger {
  private logger: winston.Logger;

  constructor(config: LoggerConfig) {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'service'] }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, service, metadata }) => {
        const meta = Object.keys(metadata || {}).length ? JSON.stringify(metadata) : '';
        return `${timestamp} [${service}] ${level}: ${message} ${meta}`;
      })
    );

    const transports = createWinstonTransports(config);

    this.logger = winston.createLogger({
      level: config.level,
      defaultMeta: { service: config.serviceName },
      format: logFormat,
      transports,
    });

    if (config.consoleEnabled) {
      this.logger.add(
        new winston.transports.Console({
          format: consoleFormat,
        })
      );
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta);
  }
}
