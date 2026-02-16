import { BotInitializer, InitializationContext, BotContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { CommandModule } from '@presentation/commands/base/command.module';

export class CommandsInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.cloudflareGateway) {
      throw new Error('cloudflareGateway not initialized');
    }
    
    const commandModule = new CommandModule<BotContext>(context.cloudflareGateway);
    commandModule.getRegistry().setupBot(context.bot);
  }
}
