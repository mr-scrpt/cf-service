import { AppError } from './app-error';

/**
 * Infrastructure layer errors - external systems, APIs, databases
 */
export class InfrastructureError extends AppError {
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message, `INFRA.${code}`, meta);
    }
}

// Cloudflare-specific errors

export class CloudflareApiError extends InfrastructureError {
    constructor(
        message: string,
        public readonly statusCode?: number,
        public readonly apiErrorCode?: string,
        meta?: Record<string, unknown>
    ) {
        super(
            message,
            'CLOUDFLARE_API_ERROR',
            { ...meta, statusCode, apiErrorCode }
        );
    }
}

export class RateLimitError extends InfrastructureError {
    constructor(retryAfter?: number) {
        super(
            'Rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            { retryAfter }
        );
    }
}

export class NetworkError extends InfrastructureError {
    constructor(message: string, originalError?: Error) {
        super(
            `Network error: ${message}`,
            'NETWORK_ERROR',
            { originalError: originalError?.message }
        );
    }
}
