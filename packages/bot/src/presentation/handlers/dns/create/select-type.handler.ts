import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { CreateDnsFlow } from '@application/flows';
import { DomainIndexPayload } from '@shared/types/payloads';
import { SessionParser } from '@presentation/parsers';

export class DnsCreateSelectTypeHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: DomainIndexPayload): Promise<void> {
    const domain = SessionParser.getDomainByIndex(ctx, payload.idx);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    SessionParser.setSelectedZone(ctx, domain);
    await this.createFlow.showTypeSelector(ctx);
  }
}
