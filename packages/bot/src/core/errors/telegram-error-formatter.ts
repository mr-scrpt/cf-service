import { ERROR_EMOJI_MAP } from './error-messages';
import { ERROR_FORMATTERS } from './error-formatter-registry';

/**
 * Telegram-specific error formatter
 * Main entry point for formatting errors for Telegram bot
 * 
 * To add new error type: 
 * 1. Add formatting function to error-formatters.ts
 * 2. Add entry to ERROR_FORMATTERS in error-formatter-registry.ts
 */
export class TelegramErrorFormatter {
  /**
   * Format error for Telegram user with detailed information
   * Uses registry-based dispatch for clean extensibility
   */
  static format(error: Error): string {
    // Try each registered formatter in order
    for (const entry of ERROR_FORMATTERS) {
      if (entry.guard(error)) {
        // TypeScript can't narrow through readonly array, so we cast
        return entry.format(error as any);
      }
    }
    
    // No formatter matched - unknown error
    return `${ERROR_EMOJI_MAP.DEFAULT} <b>Unexpected Error</b>\n\nSomething went wrong. Please try again later.`;
  }
}
