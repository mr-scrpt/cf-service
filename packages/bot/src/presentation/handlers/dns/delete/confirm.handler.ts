import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { DeleteDnsFlow } from '@application/flows';
import { DeleteRecordConfirmPayload } from '@shared/types/payloads';

export class DnsDeleteConfirmHandler implements CallbackHandler<DeleteRecordConfirmPayload> {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: DeleteRecordConfirmPayload): Promise<void> {
    await this.deleteFlow.deleteRecord(ctx, payload.idx);
  }
}
