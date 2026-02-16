import { AppError } from '@cloudflare-bot/shared';

export class PresentationError extends AppError {
  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message, `PRESENTATION.${code}`, meta);
  }
}

export class InvalidRequestParamError extends PresentationError {
  constructor(paramName: string, reason: string, providedValue?: unknown) {
    super(
      `Invalid request parameter: ${paramName}. ${reason}`,
      'INVALID_REQUEST_PARAM',
      { paramName, reason, providedValue }
    );
  }
}

export class MissingRequestParamError extends PresentationError {
  constructor(paramName: string) {
    super(
      `Missing required parameter: ${paramName}`,
      'MISSING_REQUEST_PARAM',
      { paramName }
    );
  }
}

export class InvalidParamTypeError extends PresentationError {
  constructor(paramName: string, expectedType: string, providedValue: unknown) {
    super(
      `Invalid type for parameter: ${paramName}. Expected ${expectedType}, got: ${providedValue}`,
      'INVALID_PARAM_TYPE',
      { paramName, expectedType, providedValue }
    );
  }
}
