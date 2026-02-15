import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { CreateDnsFlow } from '@application/flows';
import { TypeSelectionPayload } from '@shared/types/payloads';
import { SessionValidator } from '@services/session/session-validator.service';

export class DnsSelectTypeHandler implements CallbackHandler<TypeSelectionPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: TypeSelectionPayload): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    if (!zone) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    await this.createFlow.startWizard(ctx, zone.zoneId, zone.zoneName, payload.type);
  }
}
