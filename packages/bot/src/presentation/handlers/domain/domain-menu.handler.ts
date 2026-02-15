import { CallbackHandler, SessionContext } from '../../../infrastructure/routing';
import { DomainMenu } from '../../../application/flows';

export class DomainMenuHandler implements CallbackHandler<void> {
  constructor(private readonly domainMenu: DomainMenu) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.domainMenu.showMenu(ctx);
  }
}
