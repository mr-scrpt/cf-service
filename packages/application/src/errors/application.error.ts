export abstract class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DomainAlreadyRegisteredError extends ApplicationError {
  constructor(domain: string) {
    super(
      `Domain ${domain} is already registered`,
      'DOMAIN_ALREADY_REGISTERED',
      { domain }
    );
  }
}

export class UserNotFoundError extends ApplicationError {
  constructor(identifier: number | string) {
    const message = typeof identifier === 'number' 
      ? `User with telegram ID ${identifier} not found`
      : `User @${identifier} not found. User must interact with bot first.`;
    super(message, 'USER_NOT_FOUND', { identifier });
  }
}

export class UserAlreadyExistsError extends ApplicationError {
  constructor(telegramId: number) {
    super(
      `User with telegram ID ${telegramId} already exists`,
      'USER_ALREADY_EXISTS',
      { telegramId }
    );
  }
}
