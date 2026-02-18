import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class SecurityInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    const middlewareConfigurator = context.botContainer.getMiddlewareConfigurator();
    middlewareConfigurator.configureMiddleware(context.bot, context.container);
  }
}
