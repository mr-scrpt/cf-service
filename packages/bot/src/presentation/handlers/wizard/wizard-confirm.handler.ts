import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { IWizardEngine } from '@application/ports';

export class WizardConfirmHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: IWizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.wizardEngine.confirm(ctx);
  }
}
