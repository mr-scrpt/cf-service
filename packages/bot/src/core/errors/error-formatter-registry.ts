import { ValidationError, InfrastructureError, AppError } from '@cloudflare-bot/shared';
import { formatValidationError, formatInfrastructureError, formatAppError } from './error-formatters';

/**
 * Error formatter registry - declarative configuration
 * Defines the order in which error types should be checked and formatted
 * 
 * To add new error type:
 * 1. Add formatting function to error-formatters.ts
 * 2. Add entry here with guard + format function
 */

export interface ErrorFormatterEntry<T extends Error = Error> {
  /**
   * Type guard to check if error matches this type
   */
  guard: (error: Error) => error is T;
  
  /**
   * Format function to convert error to user-friendly message
   */
  format: (error: T) => string;
}

/**
 * Registry of error formatters in order of priority
 * Order matters: first match wins
 */
export const ERROR_FORMATTERS = [
  // Validation errors - most specific first
  {
    guard: (e: Error): e is ValidationError => e instanceof ValidationError,
    format: formatValidationError,
  },
  
  // Infrastructure errors (Cloudflare API, network, etc)
  {
    guard: (e: Error): e is InfrastructureError => e instanceof InfrastructureError,
    format: formatInfrastructureError,
  },
  
  // Generic application errors - least specific
  {
    guard: (e: Error): e is AppError => e instanceof AppError,
    format: formatAppError,
  },
  
  // Add more error types here
  // Example:
  // {
  //   guard: (e): e is NetworkError => e instanceof NetworkError,
  //   format: formatNetworkError,
  // },
] as const;
