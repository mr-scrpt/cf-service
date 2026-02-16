import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { CreateDnsFlow } from '@application/flows';
import { TypeSelectionPayload } from '@shared/types/payloads';
import { SessionParser } from '@presentation/parsers';

export class DnsSelectTypeHandler implements CallbackHandler<TypeSelectionPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: TypeSelectionPayload): Promise<void> {
    const zone = SessionParser.getSelectedZone(ctx);
    if (!zone) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    await this.createFlow.startWizard(ctx, zone.zoneId, zone.zoneName, payload.type);
  }
}
