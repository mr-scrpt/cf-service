import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class InfrastructureInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.wizardEngine = context.botContainer.getWizardEngine();
  }
}
