import { CallbackHandler, SessionContext } from '../routing';
import { WizardEngine } from '../wizard';

export class WizardConfirmHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.wizardEngine.confirm(ctx);
  }
}
