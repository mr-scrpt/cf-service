import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { DomainMenuFlow } from '@application/flows';

export class DomainMenuHandler implements CallbackHandler<void> {
  constructor(private readonly domainMenu: DomainMenuFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.domainMenu.showMenu(ctx);
  }
}
