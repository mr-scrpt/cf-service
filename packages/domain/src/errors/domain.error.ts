import { DomainError } from './base.error';

export class InvalidDomainNameError extends DomainError {
  constructor(domain: string) {
    super(`Invalid domain name: ${domain}`, 'INVALID_DOMAIN_NAME', { domain });
  }
}

export class InvalidDomainIdError extends DomainError {
  constructor(id: string) {
    super(`Invalid domain ID: ${id}`, 'INVALID_DOMAIN_ID', { id });
  }
}

export class InvalidUserIdError extends DomainError {
  constructor(userId: string) {
    super(`Invalid user ID: ${userId}`, 'INVALID_USER_ID', { userId });
  }
}

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`, 'INVALID_EMAIL', { email });
  }
}
