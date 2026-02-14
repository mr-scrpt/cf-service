import { CallbackHandler, SessionContext } from '../routing';
import { CreateDnsFlow, ListDnsFlow, DeleteDnsFlow, MainMenuFlow } from '../flows';
import { WizardEngine } from '../wizard';
import { FlowStep } from '../constants';
import {
  DomainSelectionPayload,
  DomainIndexPayload,
  TypeSelectionPayload,
  ListRecordsPayload,
  PaginationPayload,
  DeleteRecordSelectPayload,
  DeleteRecordConfirmPayload,
  WizardOptionPayload,
} from './handler-payloads';
import { SessionValidator } from './session-validators';
import { DeleteHandlerStrategy } from './delete-handler-strategy';

export class DnsManagementHandler implements CallbackHandler<void> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.createFlow.showDomainSelector(ctx);
  }
}

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

export class DnsSelectTypeHandler implements CallbackHandler<TypeSelectionPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: TypeSelectionPayload): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    if (!zone) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    await this.createFlow.startWizard(ctx, zone.zoneId, zone.zoneName, payload.type);
  }
}

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

export class PageNavigationHandler implements CallbackHandler<PaginationPayload> {
  constructor(private readonly listFlow: ListDnsFlow) {}

  async handle(ctx: SessionContext, payload: PaginationPayload): Promise<void> {
    await this.listFlow.showRecords(ctx, payload.page);
  }
}

export class DnsDeleteSelectHandler implements CallbackHandler<DeleteRecordSelectPayload> {
  private readonly strategy: DeleteHandlerStrategy;

  constructor(private readonly deleteFlow: DeleteDnsFlow) {
    this.strategy = new DeleteHandlerStrategy(deleteFlow);
  }

  async handle(ctx: SessionContext, payload?: DeleteRecordSelectPayload): Promise<void> {
    if (!payload || !payload.step) {
      await this.deleteFlow.showDomainSelector(ctx);
      return;
    }

    await this.strategy.handle(ctx, payload.step, { idx: payload.idx });
  }
}

export class DnsDeleteConfirmHandler implements CallbackHandler<DeleteRecordConfirmPayload> {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: DeleteRecordConfirmPayload): Promise<void> {
    await this.deleteFlow.deleteRecord(ctx, payload.idx);
  }
}

export class WizardSelectOptionHandler implements CallbackHandler<WizardOptionPayload> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext, payload: WizardOptionPayload): Promise<void> {
    await this.wizardEngine.handleOptionSelect(ctx, payload.value);
  }
}

export class WizardSkipHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.wizardEngine.skip(ctx);
  }
}

export class NavigationCancelHandler implements CallbackHandler<unknown> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    const isActive = await this.wizardEngine.isActive(ctx);
    if (isActive) {
      await this.wizardEngine.cancel(ctx);
    }
  }
}

export class NavigationMainMenuHandler implements CallbackHandler<unknown> {
  constructor(private readonly mainMenuFlow: MainMenuFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.mainMenuFlow.show(ctx);
  }
}
