import { AppError, ValidationError } from '@cloudflare-bot/shared';
import { ERROR_EMOJI_MAP, ERROR_MESSAGE_MAP } from './error-messages';
import type { ErrorLayer } from './error-types';

/**
 * Error to user-friendly message mapper
 * Pure utility class - all data comes from error-codes.ts
 */
export class ErrorMapper {
    static toUserMessage(error: Error): string {
        // Handle validation errors with custom formatting
        if (error instanceof ValidationError) {
            return `${ERROR_EMOJI_MAP.VALIDATION} Invalid input:\n${error.getUserFriendlyMessage()}`;
        }

        // Handle application errors
        if (error instanceof AppError) {
            return this.mapAppError(error);
        }

        // Unknown error - don't expose internals
        return `${ERROR_EMOJI_MAP.DEFAULT} An unexpected error occurred. Please try again later.`;
    }

    private static mapAppError(error: AppError): string {
        const emoji = this.getEmojiForCode(error.code);
        const message = ERROR_MESSAGE_MAP[error.code];

        if (message) {
            return `${emoji} ${message}`;
        }

        // Fallback to error message if no mapping found
        return `${emoji} ${error.message}`;
    }

    private static getEmojiForCode(code: string): string {
        const [layer] = code.split('.') as [ErrorLayer];
        return ERROR_EMOJI_MAP[layer] ?? ERROR_EMOJI_MAP.DEFAULT;
    }
}
