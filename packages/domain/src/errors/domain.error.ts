export abstract class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidDomainNameError extends DomainError {
  constructor(domain: string) {
    super(`Invalid domain name: ${domain}`, 'INVALID_DOMAIN_NAME');
  }
}

export class DomainNotFoundError extends DomainError {
  constructor(domain: string) {
    super(`Domain not found: ${domain}`, 'DOMAIN_NOT_FOUND');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`, 'USER_NOT_FOUND');
  }
}
