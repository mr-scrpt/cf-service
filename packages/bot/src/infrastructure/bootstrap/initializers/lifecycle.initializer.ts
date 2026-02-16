import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class LifecycleInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.lifecycleManager.setupErrorHandling(context.bot);
    context.lifecycleManager.setupProcessHandlers(context.bot);
  }
}
