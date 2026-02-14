import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, DnsRecord } from '@cloudflare-bot/shared';
import { KeyboardBuilder } from '../../ui/components';
import { DnsRecordFormatter } from '../../ui/formatters';
import { CallbackAction, FlowStep } from '../../constants';
import { SessionData } from '../../types';
import { SessionValidator } from '../../handlers/session-validators';
import { MainMenu } from '../main-menu';
import { DnsStrategyRegistry } from '../../strategies';
import { FieldConfig } from '../../strategies/field-config.interface';

type SessionContext = Context & SessionFlavor<SessionData>;

export class EditDnsFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly formatter: DnsRecordFormatter,
    private readonly mainMenu: MainMenu,
    private readonly strategyRegistry: DnsStrategyRegistry
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    const domains = await this.gateway.listDomains();

    if (domains.length === 0) {
      await ctx.reply('❌ No domains found. Please register a domain first.');
      return;
    }

    ctx.session.tempDomains = domains;

    const keyboard = new KeyboardBuilder();
    domains.forEach((domain, index) => {
      keyboard.addButton(domain.name, CallbackAction.DNS_EDIT_SELECT_RECORD, { idx: index });
    });
    keyboard.addNavigation({ back: true });

    const message = this.formatDomainSelectorMessage();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  async showRecords(ctx: SessionContext, domainIndex: number): Promise<void> {
    const domain = SessionValidator.getDomainByIndex(ctx, domainIndex);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }

    SessionValidator.setSelectedZone(ctx, domain);

    const records = await this.gateway.listDnsRecords(domain.id);

    if (records.length === 0) {
      await ctx.editMessageText('❌ No DNS records found for this domain.', {
        parse_mode: 'HTML',
        reply_markup: this.mainMenu.getMainMenuKeyboard().build(),
      });
      return;
    }

    ctx.session.tempRecords = records;

    const keyboard = new KeyboardBuilder();
    records.forEach((record, index) => {
      const strategy = this.strategyRegistry.getStrategy(record.type);
      keyboard.addButton(
        `${strategy.icon} ${record.name} (${record.type})`,
        CallbackAction.DNS_EDIT_FIELD,
        { idx: index }
      );
    });
    keyboard.addNavigation({ back: true, cancel: true });

    const message = this.formatRecordSelectorMessage(domain.name, records);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  async showFieldSelector(ctx: SessionContext, recordIndex: number): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    const record = SessionValidator.getRecordByIndex(ctx, recordIndex);

    if (!zone || !record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }

    // Store record index in session for later use

    const strategy = this.strategyRegistry.getStrategy(record.type);
    const fieldConfigs = strategy.getFieldConfigs();

    const keyboard = this.buildFieldKeyboard(fieldConfigs, recordIndex);
    const message = this.formatFieldSelectorMessage(record, fieldConfigs);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  async editField(ctx: SessionContext, recordIndex: number, fieldKey: string): Promise<void> {
    const record = SessionValidator.getRecordByIndex(ctx, recordIndex);
    if (!record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }

    const strategy = this.strategyRegistry.getStrategy(record.type);
    const fieldConfigs = strategy.getFieldConfigs();
    const fieldConfig = fieldConfigs.find(f => f.key === fieldKey);

    if (!fieldConfig) {
      await ctx.reply('❌ Field not found. Please try again.');
      return;
    }

    ctx.session.editField = {
      recordIndex,
      fieldKey,
      fieldConfig: fieldConfig as unknown,
    };

    const currentValue = this.getFieldCurrentValue(record, fieldKey);
    const message = this.formatFieldEditPrompt(fieldConfig, currentValue);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
    });

    await ctx.reply('💬 Please enter the new value:', { parse_mode: 'HTML' });
  }

  async saveField(ctx: SessionContext, newValue: string): Promise<void> {
    const editField = ctx.session.editField;
    const record = SessionValidator.getRecordByIndex(ctx, editField!.recordIndex);
    const zone = SessionValidator.getSelectedZone(ctx);

    if (!editField || !record || !zone) {
      await ctx.reply('❌ Edit session expired. Please try again.');
      return;
    }

    const fieldConfig = editField.fieldConfig as FieldConfig;
    const validation = fieldConfig.validationSchema.safeParse(newValue);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid input';
      await ctx.reply(`❌ ${errorMessage}\n\nPlease try again:`, { parse_mode: 'HTML' });
      return;
    }

    try {
      const updatedRecord = {
        ...record,
        [fieldConfig.key]: validation.data,
      };

      // Update record through gateway
      await this.gateway.updateDnsRecord(record.id, zone.zoneId, updatedRecord as any);

      delete ctx.session.editField;

      const oldValue = (record as any)[fieldConfig.key] || 'Not set';
      const successMessage = `✅ <b>DNS Record Updated!</b>\n\n<b>${fieldConfig.label}</b> changed from <code>${oldValue}</code> to <code>${validation.data}</code>`;
      const keyboard = this.mainMenu.getMainMenuKeyboard();

      await ctx.reply(successMessage, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      await ctx.reply(`❌ Failed to update DNS record: ${(error as Error).message}`);
      throw error;
    }
  }

  private buildFieldKeyboard(fieldConfigs: FieldConfig[], recordIndex: number): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();
    
    fieldConfigs.forEach((field) => {
      keyboard.addButton(
        `✏️ ${field.label}`,
        CallbackAction.DNS_EDIT_FIELD,
        { idx: recordIndex, field: field.key }
      );
    });

    keyboard.addNavigation({ back: true, cancel: true });
    return keyboard;
  }

  private formatDomainSelectorMessage(): string {
    return `✏️ <b>Edit DNS Record</b>

Select a domain:`;
  }

  private formatRecordSelectorMessage(zoneName: string, records: DnsRecord[]): string {
    const recordList = records
      .map((r, i) => {
        const content = (r as any).content || (r as any).data?.target || 'N/A';
        return `${i + 1}. <b>${r.name}</b> (${r.type}) → ${content}`;
      })
      .join('\n');

    return `✏️ <b>Edit DNS Record</b>
<b>Domain:</b> ${zoneName}

Select a record to edit:
${recordList}`;
  }

  private formatFieldSelectorMessage(record: DnsRecord, fieldConfigs: FieldConfig[]): string {
    const fieldList = fieldConfigs
      .map((f) => {
        const currentValue = this.getFieldCurrentValue(record, f.key);
        return `• <b>${f.label}:</b> ${currentValue || 'Not set'}`;
      })
      .join('\n');

    return `✏️ <b>Edit DNS Record</b>
<b>Type:</b> ${record.type}
<b>Name:</b> ${record.name}

<b>Current values:</b>
${fieldList}

Select a field to edit:`;
  }

  private formatFieldEditPrompt(fieldConfig: FieldConfig, currentValue: unknown): string {
    let prompt = `✏️ <b>Editing: ${fieldConfig.label}</b>\n\n`;
    prompt += `<b>Current value:</b> ${currentValue || 'Not set'}\n\n`;
    
    if (fieldConfig.helpText) {
      prompt += `ℹ️ ${fieldConfig.helpText}\n\n`;
    }
    
    if (fieldConfig.placeholder) {
      prompt += `📝 Example: ${fieldConfig.placeholder}\n`;
    }

    return prompt;
  }

  private getFieldCurrentValue(record: DnsRecord, fieldKey: string): unknown {
    const value = (record as any)[fieldKey];
    if (value === undefined || value === null) {
      return 'Not set';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }
}
