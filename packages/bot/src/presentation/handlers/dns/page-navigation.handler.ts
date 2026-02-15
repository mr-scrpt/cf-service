import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { ListDnsFlow } from '@application/flows';
import { PaginationPayload } from '@shared/types/payloads';

export class PageNavigationHandler implements CallbackHandler<PaginationPayload> {
  constructor(private readonly listFlow: ListDnsFlow) {}

  async handle(ctx: SessionContext, payload: PaginationPayload): Promise<void> {
    await this.listFlow.showRecords(ctx, payload.page);
  }
}
