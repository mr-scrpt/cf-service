import {
    DOMAIN_ERROR_CODES,
    APP_ERROR_CODES,
    INFRA_ERROR_CODES,
    BOT_ERROR_CODES,
} from './error-codes';

/**
 * User-facing error messages and emoji
 * 
 * Used by ErrorMapper to display friendly messages to users
 */

// Emoji mapping by error layer
export const ERROR_EMOJI_MAP = {
    DOMAIN: '🌐',
    APP: '⚠️',
    INFRA: '🔧',
    BOT: '🤖',
    VALIDATION: '❌',
    DEFAULT: '❌',
} as const;

// User-facing error messages
export const ERROR_MESSAGE_MAP: Record<string, string> = {
    // Domain errors
    [DOMAIN_ERROR_CODES.INVALID_DOMAIN_NAME]: 'Invalid domain name format',
    [DOMAIN_ERROR_CODES.DNS_RECORD_CONFLICT]: 'DNS record already exists',

    // Application errors
    [APP_ERROR_CODES.DOMAIN_ALREADY_REGISTERED]: 'This domain is already registered',
    [APP_ERROR_CODES.ZONE_NOT_FOUND]: 'Zone not found. Please check the Zone ID',
    [APP_ERROR_CODES.QUOTA_EXCEEDED]: 'Quota exceeded',

    // Infrastructure errors
    [INFRA_ERROR_CODES.CLOUDFLARE_API_ERROR]: 'Cloudflare API error. Please try again',
    [INFRA_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment',
    [INFRA_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',

    // Bot errors
    [BOT_ERROR_CODES.AUTH_ERROR]: 'Access denied. You are not authorized to use this bot',
    [BOT_ERROR_CODES.COMMAND_NOT_FOUND]: 'Command not found',
    [BOT_ERROR_CODES.INVALID_COMMAND_FORMAT]: 'Invalid command format',
};
