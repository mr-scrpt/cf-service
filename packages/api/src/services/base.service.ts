import { Result } from '@cloudflare-bot/application';
import type { ILogger } from '@cloudflare-bot/application';

export abstract class BaseService {
  constructor(protected logger: ILogger) {}

  protected async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<Result<T, Error>> {
    try {
      const result = await operation();
      
      this.logger.info(`${operationName} succeeded`, context);
      
      return Result.ok(result);
    } catch (error) {
      this.logger.error(`${operationName} failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'code' in (error as any) ? (error as any).code : undefined,
        ...context,
      });
      
      return Result.fail(error as Error);
    }
  }
}
