import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { IWizardEngine } from '@application/ports';

export class NavigationCancelHandler implements CallbackHandler<unknown> {
  constructor(private readonly wizardEngine: IWizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    const isActive = await this.wizardEngine.isActive(ctx);
    if (isActive) {
      await this.wizardEngine.cancel(ctx);
    }
  }
}
