import winston from 'winston';
import { LoggerPort } from './ports';

const consoleFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

export enum LoggerMode {
  JSON = 'json',
  Pretty = 'pretty',
}

export enum LoggerLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

export interface LoggerOptions {
  service: string;
  level?: LoggerLevel;
  mode?: LoggerMode;
  logFile?: string;
}

export class LoggerAdapter implements LoggerPort {
  private readonly logger: winston.Logger;

  constructor(options: LoggerOptions) {
    const level = options.level || LoggerLevel.Info;
    const mode = options.mode || LoggerMode.JSON;

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format:
          mode === LoggerMode.JSON
            ? undefined
            : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              consoleFormat,
            ),
      }),
    ];

    if (options.logFile) {
      transports.push(
        new winston.transports.File({
          filename: options.logFile,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: level,
      defaultMeta: { service: options.service },
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports,
    });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }
}
