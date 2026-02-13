import { AppError } from './app-error';

/**
 * Application layer errors - business rule violations
 */
export class ApplicationError extends AppError {
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message, `APP.${code}`, meta);
    }
}

// Business logic errors

export class DomainAlreadyRegisteredError extends ApplicationError {
    constructor(domain: string) {
        super(
            `Domain ${domain} is already registered`,
            'DOMAIN_ALREADY_REGISTERED',
            { domain }
        );
    }
}

export class ZoneNotFoundError extends ApplicationError {
    constructor(zoneId: string) {
        super(
            `Zone ${zoneId} not found`,
            'ZONE_NOT_FOUND',
            { zoneId }
        );
    }
}

export class QuotaExceededError extends ApplicationError {
    constructor(resource: string, limit: number) {
        super(
            `Quota exceeded for ${resource}: limit is ${limit}`,
            'QUOTA_EXCEEDED',
            { resource, limit }
        );
    }
}
