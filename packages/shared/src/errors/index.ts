// Base error
export { AppError } from './app-error';

// Layer-specific errors
export {
    DomainError,
    InvalidDomainNameError,
    DnsRecordConflictError,
} from './domain.error';

export {
    ValidationError,
} from './validation.error';

export {
    ApplicationError,
    DomainAlreadyRegisteredError,
    ZoneNotFoundError,
    QuotaExceededError,
} from './application.error';

export {
    InfrastructureError,
    CloudflareApiError,
    RateLimitError,
    NetworkError,
} from './infrastructure.error';
