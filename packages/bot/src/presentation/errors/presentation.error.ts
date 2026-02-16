import { AppError } from '@cloudflare-bot/shared';

export class PresentationError extends AppError {
  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message, `PRESENTATION.${code}`, meta);
  }
}

export class AuthorizationError extends PresentationError {
  constructor(userId?: number) {
    super(`Access denied for user ${userId || 'unknown'}`, 'AUTH_ERROR', { userId });
  }
}

export class CommandNotFoundError extends PresentationError {
  constructor(command: string) {
    super(`Command /${command} not found`, 'COMMAND_NOT_FOUND', { command });
  }
}

export class InvalidCommandFormatError extends PresentationError {
  constructor(command: string, expectedFormat: string) {
    super(
      `Invalid format for /${command}. Expected: ${expectedFormat}`,
      'INVALID_COMMAND_FORMAT',
      { command, expectedFormat }
    );
  }
}
