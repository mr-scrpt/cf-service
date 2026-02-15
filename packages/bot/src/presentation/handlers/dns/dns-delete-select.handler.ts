import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { DeleteDnsFlow } from '@application/flows';
import { DeleteRecordSelectPayload } from '@shared/types/payloads';
import { DeleteHandlerStrategy } from '@services/strategies/delete-flow.strategy';

export class DnsDeleteSelectHandler implements CallbackHandler<DeleteRecordSelectPayload> {
  private readonly strategy: DeleteHandlerStrategy;

  constructor(private readonly deleteFlow: DeleteDnsFlow) {
    this.strategy = new DeleteHandlerStrategy(deleteFlow);
  }

  async handle(ctx: SessionContext, payload?: DeleteRecordSelectPayload): Promise<void> {
    if (!payload || !payload.step) {
      await this.deleteFlow.showDomainSelector(ctx);
      return;
    }

    await this.strategy.handle(ctx, payload.step, { idx: payload.idx });
  }
}
