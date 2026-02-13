/**
 * Cloudflare Gateway Configuration
 * Centralized configuration for Cloudflare API interactions
 */

/**
 * Pagination settings for Cloudflare API list operations
 */
export const CLOUDFLARE_PAGE_SIZE = {
    ZONES: 50,
    DNS_RECORDS: 100,
} as const;

/**
 * Retry behavior for transient network errors
 */
export const CLOUDFLARE_RETRY_CONFIG = {
    /** Maximum number of retry attempts */
    MAX_ATTEMPTS: 3,
    /** HTTP status codes that should trigger a retry */
    RETRYABLE_STATUS_CODES: [429, 503, 504],
    /** Base delay in milliseconds for exponential backoff */
    BASE_DELAY_MS: 1000,
} as const;

export type CloudflarePageSize = typeof CLOUDFLARE_PAGE_SIZE;
export type CloudflareRetryConfig = typeof CLOUDFLARE_RETRY_CONFIG;
