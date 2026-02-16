import { AppError } from './app-error';

export interface CloudflareErrorDetails {
  code: number;
  message: string;
}

export class InfrastructureError extends AppError {
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message, `INFRA.${code}`, meta);
    }

    static isInstance(error: Error): error is InfrastructureError {
        return error instanceof InfrastructureError;
    }
}

export class CloudflareApiError extends InfrastructureError {
    public readonly statusCode?: number;
    public readonly cloudflareErrors?: CloudflareErrorDetails[];

    constructor(
        message: string,
        statusCode?: number,
        cloudflareErrors?: CloudflareErrorDetails[]
    ) {
        super(message, 'CLOUDFLARE_API_ERROR');
        this.statusCode = statusCode;
        this.cloudflareErrors = cloudflareErrors;
    }

    getFirstError(): CloudflareErrorDetails | undefined {
        return this.cloudflareErrors?.[0];
    }

    static isInstance(error: Error): error is CloudflareApiError {
        return error instanceof CloudflareApiError;
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
    public readonly originalError?: Error;
    public readonly isTimeout: boolean;

    constructor(message: string, originalError?: Error, isTimeout = false) {
        super(`Network error: ${message}`, 'NETWORK_ERROR');
        this.originalError = originalError;
        this.isTimeout = isTimeout;
    }

    static isInstance(error: Error): error is NetworkError {
        return error instanceof NetworkError;
    }
}
