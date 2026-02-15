import winston from 'winston';

export interface LoggerTransportConfig {
  type: 'file' | 'console';
  filename?: string;
  level?: string;
  maxsize?: number;
  maxFiles?: number;
}

export interface LoggerConfig {
  serviceName: string;
  level: string;
  transports: LoggerTransportConfig[];
  consoleEnabled: boolean;
}

export class LoggerConfigBuilder {
  private config: Partial<LoggerConfig> = {
    transports: [],
    consoleEnabled: true,
  };

  withServiceName(name: string): this {
    this.config.serviceName = name;
    return this;
  }

  withLevel(level: string): this {
    this.config.level = level;
    return this;
  }

  addFileTransport(filename: string, level?: string, maxsize = 5242880, maxFiles = 5): this {
    this.config.transports!.push({
      type: 'file',
      filename,
      level,
      maxsize,
      maxFiles,
    });
    return this;
  }

  enableConsole(enabled = true): this {
    this.config.consoleEnabled = enabled;
    return this;
  }

  build(): LoggerConfig {
    if (!this.config.serviceName) {
      throw new Error('Service name is required');
    }
    if (!this.config.level) {
      throw new Error('Log level is required');
    }

    return this.config as LoggerConfig;
  }
}

export function createWinstonTransports(config: LoggerConfig): winston.transport[] {
  const transports: winston.transport[] = [];

  config.transports.forEach(transportConfig => {
    if (transportConfig.type === 'file') {
      transports.push(
        new winston.transports.File({
          filename: transportConfig.filename!,
          level: transportConfig.level,
          maxsize: transportConfig.maxsize,
          maxFiles: transportConfig.maxFiles,
        })
      );
    }
  });

  return transports;
}
