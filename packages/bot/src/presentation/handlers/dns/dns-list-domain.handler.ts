import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { ListDnsFlow } from '../../../application/flows';
import { DomainIndexPayload } from '../../../shared/types/payloads';
import { SessionValidator } from '../../../services/session/session-validator.service';

export class DnsListDomainHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly listFlow: ListDnsFlow) {}

  async handle(ctx: SessionContext, payload?: DomainIndexPayload): Promise<void> {
    if (!payload || payload.idx === undefined) {
      await this.listFlow.showDomainSelector(ctx);
      return;
    }

    const domain = SessionValidator.getDomainByIndex(ctx, payload.idx);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    SessionValidator.setSelectedZone(ctx, domain);
    await this.listFlow.showRecords(ctx, 0);
  }
}
