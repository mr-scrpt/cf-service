import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LoggerPort } from '../ports';
import { resolve } from 'path';

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
  logDir?: string;      // Directory for log files (absolute path)
  filename?: string;    // Filename without extension
}

export class LoggerAdapter implements LoggerPort {
  private readonly logger: winston.Logger;

  constructor(options: LoggerOptions) {
    const level = options.level || LoggerLevel.Info;
    const mode = options.mode || LoggerMode.JSON;

    // Determine log directory (absolute path)
    const logDir = options.logDir
      ? resolve(options.logDir)
      : resolve(process.cwd(), 'logs');

    const filename = options.filename || options.service;

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

    // Add file transport with daily rotation
    if (logDir && filename) {
      transports.push(
        new DailyRotateFile({
          dirname: logDir,
          filename: `${filename}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        })
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
