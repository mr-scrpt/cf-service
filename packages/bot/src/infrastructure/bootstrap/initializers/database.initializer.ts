import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { logger } from '@shared/utils/logger';

export class DatabaseInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    await context.container.getDatabaseService().connect();
    logger.info('Database connected');
  }
}
