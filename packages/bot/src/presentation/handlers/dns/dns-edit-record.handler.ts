import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { EditDnsFlow } from '@application/flows';
import { EditRecordSelectPayload } from '@shared/types/payloads';

export class DnsEditRecordHandler implements CallbackHandler<EditRecordSelectPayload> {
  constructor(private readonly editFlow: EditDnsFlow) {}

  async handle(ctx: SessionContext, payload: EditRecordSelectPayload): Promise<void> {
    await this.editFlow.showRecords(ctx, payload.idx);
  }
}
