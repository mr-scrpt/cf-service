import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { CreateDomainFlow } from '@application/flows';

export class DomainCreateHandler implements CallbackHandler<void> {
  constructor(private readonly createFlow: CreateDomainFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.createFlow.startWizard(ctx);
  }
}
