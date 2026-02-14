import { CallbackHandler, SessionContext } from '../routing';
import { CreateDnsFlow, ListDnsFlow, DeleteDnsFlow } from '../flows';
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

export class DnsManagementHandler implements CallbackHandler<void> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.createFlow.showDomainSelector(ctx);
  }
}

export class DnsCreateSelectTypeHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: DomainIndexPayload): Promise<void> {
    const domains = ctx.session.tempDomains;
    if (!domains || !domains[payload.idx]) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    const domain = domains[payload.idx];
    // Store selected domain in session
    ctx.session.selectedZoneId = domain.id;
    ctx.session.selectedZoneName = domain.name;
    
    await this.createFlow.showTypeSelector(ctx);
  }
}

export class DnsSelectTypeHandler implements CallbackHandler<TypeSelectionPayload> {
  constructor(private readonly createFlow: CreateDnsFlow) {}

  async handle(ctx: SessionContext, payload: TypeSelectionPayload): Promise<void> {
    const zoneId = ctx.session.selectedZoneId;
    const zoneName = ctx.session.selectedZoneName;
    
    if (!zoneId || !zoneName) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    await this.createFlow.startWizard(ctx, zoneId, zoneName, payload.type);
  }
}

export class DnsListDomainHandler implements CallbackHandler<DomainIndexPayload> {
  constructor(private readonly listFlow: ListDnsFlow) {}

  async handle(ctx: SessionContext, payload: DomainIndexPayload): Promise<void> {
    const domains = ctx.session.tempDomains;
    if (!domains || !domains[payload.idx]) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }
    
    const domain = domains[payload.idx];
    ctx.session.selectedZoneId = domain.id;
    ctx.session.selectedZoneName = domain.name;
    
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
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: DeleteRecordSelectPayload): Promise<void> {
    if (payload.step === FlowStep.SELECT_RECORD) {
      const domains = ctx.session.tempDomains;
      if (!domains || payload.idx === undefined || !domains[payload.idx]) {
        await ctx.reply('❌ Domain not found. Please try again.');
        return;
      }
      
      const domain = domains[payload.idx];
      ctx.session.selectedZoneId = domain.id;
      ctx.session.selectedZoneName = domain.name;
      
      await this.deleteFlow.showRecordSelector(ctx);
    } else if (payload.step === FlowStep.CONFIRM && payload.idx !== undefined) {
      const records = ctx.session.tempRecords as any[];
      if (!records || !records[payload.idx]) {
        await ctx.reply('❌ Record not found. Please try again.');
        return;
      }
      
      const record = records[payload.idx];
      await this.deleteFlow.showConfirmation(ctx, record.id, record.name, record.type);
    }
  }
}

export class DnsDeleteConfirmHandler implements CallbackHandler<DeleteRecordConfirmPayload> {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: DeleteRecordConfirmPayload): Promise<void> {
    await this.deleteFlow.deleteRecord(ctx, payload.recordId);
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

export class NavigationCancelHandler implements CallbackHandler<void> {
  constructor(private readonly wizardEngine: WizardEngine) {}

  async handle(ctx: SessionContext): Promise<void> {
    const isWizardActive = await this.wizardEngine.isActive(ctx);
    if (isWizardActive) {
      await this.wizardEngine.cancel(ctx);
    } else {
      await ctx.editMessageText('❌ Operation cancelled');
    }
  }
}
