import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { WizardEngine } from '@infrastructure/wizard';

export class WizardConfirmHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.wizardEngine.confirm(ctx);
  }
}
