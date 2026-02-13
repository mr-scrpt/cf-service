import { AppError } from '@cloudflare-bot/shared';

export class BotError extends AppError {
  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message, `BOT.${code}`, meta);
  }
}

export class AuthorizationError extends BotError {
  constructor(userId?: number) {
    super(`Access denied for user ${userId || 'unknown'}`, 'AUTH_ERROR', { userId });
  }
}

export class CommandNotFoundError extends BotError {
  constructor(command: string) {
    super(`Command /${command} not found`, 'COMMAND_NOT_FOUND', { command });
  }
}

export class InvalidCommandFormatError extends BotError {
  constructor(command: string, expectedFormat: string) {
    super(
      `Invalid format for /${command}. Expected: ${expectedFormat}`,
      'INVALID_COMMAND_FORMAT',
      { command, expectedFormat }
    );
  }
}

// Re-export error utilities
export * from './error-codes';
export * from './error-messages';
export * from './error-types';
export * from './error-mapper';

