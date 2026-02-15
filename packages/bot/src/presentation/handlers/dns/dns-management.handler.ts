import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { DnsMenu } from '@application/flows';

export class DnsManagementHandler implements CallbackHandler<void> {
  constructor(private readonly dnsMenu: DnsMenu) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.dnsMenu.showMenu(ctx);
  }
}
