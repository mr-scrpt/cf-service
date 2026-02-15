import { AppError } from './app-error';

export interface ValidationIssue {
    path: string[];
    message: string;
    code: string;
}

export class ValidationError extends AppError {
    public readonly issues: ValidationIssue[];

    constructor(message: string, issues: ValidationIssue[]) {
        super(message, 'VALIDATION_ERROR');
        this.issues = issues;
    }

    getUserFriendlyMessage(): string {
        return this.issues.map(i => i.message).join('\n');
    }

    static isInstance(error: Error): error is ValidationError {
        return error instanceof ValidationError;
    }
}
