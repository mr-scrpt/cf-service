import { AppError } from './app-error';

export class InfrastructureError extends AppError {
    constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message, code, meta);
    }
}
