import { ValidationError, InfrastructureError, AppError } from '@cloudflare-bot/shared';
import { ERROR_EMOJI_MAP } from './error-emoji';
import { formatValidationError, formatInfrastructureError, formatAppError } from './error-formatters';

export class TelegramErrorFormatter {
  static format(error: Error): string {
    if (ValidationError.isInstance(error)) {
      return formatValidationError(error);
    }

    if (InfrastructureError.isInstance(error)) {
      return formatInfrastructureError(error);
    }

    if (AppError.isInstance(error)) {
      return formatAppError(error);
    }

    return `${ERROR_EMOJI_MAP.DEFAULT} <b>Unexpected Error</b>\n\nSomething went wrong. Please try again later.`;
  }
}
