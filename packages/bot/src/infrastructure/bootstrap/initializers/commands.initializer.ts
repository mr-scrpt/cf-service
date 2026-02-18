import { BotInitializer, InitializationContext, BotContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class CommandsInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.cloudflareGateway) {
      throw new Error('cloudflareGateway not initialized');
    }
    
    const commandModule = context.botContainer.createCommandModule(context.cloudflareGateway);
    commandModule.getRegistry().setupBot(context.bot);
  }
}
