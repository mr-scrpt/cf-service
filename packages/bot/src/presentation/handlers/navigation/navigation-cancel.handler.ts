import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { WizardEngine } from '@infrastructure/wizard';

export class NavigationCancelHandler implements CallbackHandler<unknown> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    const isActive = await this.wizardEngine.isActive(ctx);
    if (isActive) {
      await this.wizardEngine.cancel(ctx);
    }
  }
}
