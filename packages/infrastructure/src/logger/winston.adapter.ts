import winston from 'winston';
import { ILogger } from '@cloudflare-bot/application';

export class WinstonLoggerAdapter implements ILogger {
  private logger: winston.Logger;

  constructor(
    private readonly env: string,
    private readonly serviceName: string
  ) {
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

    this.logger = winston.createLogger({
      level: env === 'production' ? 'info' : 'debug',
      defaultMeta: { service: serviceName },
      format: logFormat,
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });

    if (env !== 'production') {
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
