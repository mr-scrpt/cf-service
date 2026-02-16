import type { ILogger } from '@cloudflare-bot/application';

export interface RequestLogData extends Record<string, unknown> {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export interface ResponseLogData extends Record<string, unknown> {
  method: string;
  url: string;
  statusCode: number;
  duration: string;
  body?: unknown;
}

export interface IApiLogger extends ILogger {
  logRequest?: (data: RequestLogData) => void;
  logResponse?: (data: ResponseLogData) => void;
}
