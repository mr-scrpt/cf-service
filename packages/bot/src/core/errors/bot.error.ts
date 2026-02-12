import { AppError } from '@cloudflare-bot/shared';

export class BotError extends AppError {
  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message, code, meta);
  }
}

export class AuthorizationError extends BotError {
  constructor(userId?: number) {
    super(`Access denied for user ${userId || 'unknown'}`, 'AUTH_ERROR', { userId });
  }
}
