import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { WizardEngine } from '../../../infrastructure/wizard';
import { WizardOptionPayload } from '../../../shared/types/payloads';

export class WizardSelectOptionHandler implements CallbackHandler<WizardOptionPayload> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext, payload: WizardOptionPayload): Promise<void> {
    await this.wizardEngine.handleOptionSelect(ctx, payload.value);
  }
}
