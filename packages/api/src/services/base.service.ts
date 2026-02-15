import { Result } from '@cloudflare-bot/application';
import type { ILogger } from '@cloudflare-bot/application';

type LogContext = Record<string, unknown>;

interface ErrorWithCode {
  code?: string;
}

export abstract class BaseService {
  constructor(protected logger: ILogger) {}

  protected async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: LogContext
  ): Promise<Result<T, Error>> {
    try {
      const result = await operation();
      
      this.logger.info(`${operationName} succeeded`, context);
      
      return Result.ok(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = this.extractErrorCode(error);
      
      this.logger.error(`${operationName} failed`, {
        error: errorMessage,
        code: errorCode,
        ...context,
      });
      
      return Result.fail(this.normalizeError(error));
    }
  }

  private extractErrorCode(error: unknown): string | undefined {
    if (this.isErrorWithCode(error)) {
      return error.code;
    }
    return undefined;
  }

  private isErrorWithCode(error: unknown): error is ErrorWithCode {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (typeof (error as ErrorWithCode).code === 'string' || (error as ErrorWithCode).code === undefined)
    );
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('Unknown error occurred');
  }
}
