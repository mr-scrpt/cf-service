import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { SessionManager } from '@infrastructure/session/session-manager';
import { WizardEngine, WizardValidator, WizardRenderer } from '@infrastructure/wizard';

export class InfrastructureInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    const sessionManager = new SessionManager();
    const wizardValidator = new WizardValidator();
    const wizardRenderer = new WizardRenderer();
    context.wizardEngine = new WizardEngine(sessionManager, wizardValidator, wizardRenderer);
  }
}
