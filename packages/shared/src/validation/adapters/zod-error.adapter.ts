import { z } from 'zod';
import { ValidationError, ValidationIssue } from '../../errors/validation.error';

export class ZodErrorAdapter {
    static toValidationError(zodError: z.ZodError): ValidationError {
        const issues: ValidationIssue[] = zodError.issues.map(issue => ({
            path: issue.path.map(String),
            message: issue.message,
            code: issue.code,
        }));

        const message = issues
            .map(i => `${i.path.join('.')}: ${i.message}`)
            .join(', ');

        return new ValidationError(
            `Validation failed: ${message}`,
            issues
        );
    }
}
