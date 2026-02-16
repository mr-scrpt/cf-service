import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { DnsMenuFlow } from '@application/flows';

export class DnsManagementHandler implements CallbackHandler<void> {
  constructor(private readonly dnsMenu: DnsMenuFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.dnsMenu.showMenu(ctx);
  }
}
