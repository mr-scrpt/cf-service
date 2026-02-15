import { CallbackHandler, SessionContext } from '../routing';
import { CreateDomainFlow, ListDomainFlow, DomainMenu } from '../flows';

/**
 * Domain handlers - handle domain management callbacks
 * Follows the same pattern as DNS handlers
 */

export class DomainMenuHandler implements CallbackHandler<void> {
  constructor(private readonly domainMenu: DomainMenu) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.domainMenu.showMenu(ctx);
  }
}

export class DomainCreateHandler implements CallbackHandler<void> {
  constructor(private readonly createFlow: CreateDomainFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.createFlow.startWizard(ctx);
  }
}

export class DomainListHandler implements CallbackHandler<void> {
  constructor(private readonly listFlow: ListDomainFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.listFlow.showDomainsList(ctx);
  }
}
