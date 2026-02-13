/**
 * Error code constants
 * Structure: LAYER.CATEGORY.SPECIFIC
 * 
 * Used by developers when throwing errors
 */

// Domain error codes
export const DOMAIN_ERROR_CODES = {
    INVALID_DOMAIN_NAME: 'DOMAIN.INVALID_DOMAIN_NAME',
    DNS_RECORD_CONFLICT: 'DOMAIN.DNS_RECORD_CONFLICT',
} as const;

// Application error codes
export const APP_ERROR_CODES = {
    DOMAIN_ALREADY_REGISTERED: 'APP.DOMAIN_ALREADY_REGISTERED',
    ZONE_NOT_FOUND: 'APP.ZONE_NOT_FOUND',
    QUOTA_EXCEEDED: 'APP.QUOTA_EXCEEDED',
} as const;

// Infrastructure error codes
export const INFRA_ERROR_CODES = {
    CLOUDFLARE_API_ERROR: 'INFRA.CLOUDFLARE_API_ERROR',
    RATE_LIMIT_EXCEEDED: 'INFRA.RATE_LIMIT_EXCEEDED',
    NETWORK_ERROR: 'INFRA.NETWORK_ERROR',
} as const;

// Bot error codes
export const BOT_ERROR_CODES = {
    AUTH_ERROR: 'BOT.AUTH_ERROR',
    COMMAND_NOT_FOUND: 'BOT.COMMAND_NOT_FOUND',
    INVALID_COMMAND_FORMAT: 'BOT.INVALID_COMMAND_FORMAT',
} as const;

// Validation error
export const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
