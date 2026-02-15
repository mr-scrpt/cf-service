import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { EditDnsFlow } from '../../../application/flows';
import { EditFieldPayload } from '../../../shared/types/payloads';

export class DnsEditFieldHandler implements CallbackHandler<EditFieldPayload> {
  constructor(private readonly editFlow: EditDnsFlow) {}

  async handle(ctx: SessionContext, payload: EditFieldPayload): Promise<void> {
    if (payload.field) {
      await this.editFlow.editField(ctx, payload.idx, payload.field);
    } else {
      await this.editFlow.showFieldSelector(ctx, payload.idx);
    }
  }
}
