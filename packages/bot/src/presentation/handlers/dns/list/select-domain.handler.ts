import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { ListDnsFlow } from '@application/flows';
import { DomainIndexPayload } from '@shared/types/payloads';
import { SessionParser } from '@presentation/parsers';

export class DnsListDomainHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly listFlow: ListDnsFlow) {}

  async handle(ctx: SessionContext, payload?: DomainIndexPayload): Promise<void> {
    if (!payload || payload.idx === undefined) {
      await this.listFlow.showDomainSelector(ctx);
      return;
    }

    const domain = SessionParser.getDomainByIndex(ctx, payload.idx);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    SessionParser.setSelectedZone(ctx, domain);
    await this.listFlow.showRecords(ctx, 0);
  }
}
