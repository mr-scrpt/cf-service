import { ERROR_EMOJI_MAP } from './error-messages';

/**
 * Type definitions for error handling
 */

// Error layer type - extracted from error code prefix
export type ErrorLayer = keyof typeof ERROR_EMOJI_MAP;
