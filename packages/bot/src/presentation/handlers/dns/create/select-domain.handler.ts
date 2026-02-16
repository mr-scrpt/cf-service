import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { CreateDnsFlow } from '@application/flows';

export class DnsCreateSelectDomainHandler implements CallbackHandler<void> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.createFlow.showDomainSelector(ctx);
  }
}
