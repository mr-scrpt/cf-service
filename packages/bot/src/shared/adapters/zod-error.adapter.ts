import { type ZodError } from 'zod';
import { ValidationError } from '@cloudflare-bot/shared';

export class ZodErrorAdapter {
  static toValidationError(error: ZodError): ValidationError {
    const issues = error.issues.map(issue => ({
      path: issue.path.map(String),
      message: issue.message,
      code: issue.code,
    }));
    return new ValidationError('Validation failed', issues);
  }
}
