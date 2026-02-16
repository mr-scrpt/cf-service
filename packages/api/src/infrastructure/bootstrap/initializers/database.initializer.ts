import { ApiInitializer, InitializationContext } from '../initialization-context.interface';

export class DatabaseInitializer implements ApiInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    const dbService = context.container.getDatabaseService();
    await dbService.connect();
    context.logger.info('Database connected');
  }
}
