import { AppError } from './app-error';

/**
 * Domain layer errors - invariant violations
 * Examples: Invalid domain name format, DNS record constraint violation
 */
export class DomainError extends AppError {
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message, `DOMAIN.${code}`, meta);
    }
}

// Specific domain errors

export class InvalidDomainNameError extends DomainError {
    constructor(domain: string) {
        super(
            `Invalid domain name: ${domain}`,
            'INVALID_DOMAIN_NAME',
            { domain }
        );
    }
}

export class DnsRecordConflictError extends DomainError {
    constructor(recordName: string, zoneId: string) {
        super(
            `DNS record ${recordName} already exists in zone ${zoneId}`,
            'DNS_RECORD_CONFLICT',
            { recordName, zoneId }
        );
    }
}
