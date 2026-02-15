import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { EditDnsFlow } from '@application/flows';
import { SaveAllPayload } from '@shared/types/payloads';

export class DnsSaveAllHandler implements CallbackHandler<SaveAllPayload> {
  constructor(private readonly editFlow: EditDnsFlow) {}

  async handle(ctx: SessionContext, payload: SaveAllPayload): Promise<void> {
    await this.editFlow.saveAllChanges(ctx);
  }
}
