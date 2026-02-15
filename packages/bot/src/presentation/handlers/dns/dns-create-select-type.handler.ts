import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { CreateDnsFlow } from '../../../application/flows';
import { DomainIndexPayload } from '../../../shared/types/payloads';
import { SessionValidator } from '../../../services/session/session-validator.service';

export class DnsCreateSelectTypeHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: DomainIndexPayload): Promise<void> {
    const domain = SessionValidator.getDomainByIndex(ctx, payload.idx);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    SessionValidator.setSelectedZone(ctx, domain);
    await this.createFlow.showTypeSelector(ctx);
  }
}
