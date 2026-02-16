import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { IWizardEngine } from '@application/ports';
import { WizardOptionPayload } from '@shared/types/payloads';

export class WizardSelectOptionHandler implements CallbackHandler<WizardOptionPayload> {
  constructor(private readonly wizardEngine: IWizardEngine) {}

  async handle(ctx: SessionContext, payload: WizardOptionPayload): Promise<void> {
    await this.wizardEngine.handleOptionSelect(ctx, payload.value);
  }
}
