import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { ListDomainFlow } from '../../../application/flows';

export class DomainListHandler implements CallbackHandler<void> {
  constructor(private readonly listFlow: ListDomainFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.listFlow.showDomainsList(ctx);
  }
}
