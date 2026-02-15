import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { EditDnsFlow } from '@application/flows';
import { EditDomainIndexPayload } from '@shared/types/payloads';

export class DnsEditSelectHandler implements CallbackHandler<EditDomainIndexPayload> {
  constructor(private readonly editFlow: EditDnsFlow) {}

  async handle(ctx: SessionContext, payload: EditDomainIndexPayload): Promise<void> {
    await this.editFlow.showDomainSelector(ctx);
  }
}
