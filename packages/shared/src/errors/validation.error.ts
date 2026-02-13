import { AppError } from './app-error';
import { z } from 'zod';

/**
 * Input validation errors from Zod schemas
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        public readonly errors: z.ZodIssue[],
        meta?: Record<string, unknown>
    ) {
        super(message, 'VALIDATION_ERROR', { ...meta, validationErrors: errors });
    }

    static fromZod(error: z.ZodError): ValidationError {
        const issues = error.issues;
        const message = issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return new ValidationError(
            `Validation failed: ${message}`,
            issues
        );
    }

    getUserFriendlyMessage(): string {
        return this.errors.map((e: z.ZodIssue) => e.message).join('\n');
    }
}
