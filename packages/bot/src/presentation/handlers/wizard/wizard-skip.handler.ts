import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { IWizardEngine } from '@application/ports';

export class WizardSkipHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: IWizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.wizardEngine.skip(ctx);
  }
}
