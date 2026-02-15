import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, DnsRecord } from '@cloudflare-bot/shared';
import { KeyboardBuilder } from '../../../infrastructure/ui/components';
import { DnsRecordFormatter } from '../../../infrastructure/ui/formatters';
import { CallbackAction, FlowStep } from '../../../shared/constants';
import { SessionData } from '../../../shared/types';
import { SessionValidator } from '../../../services/session/session-validator.service';
import { MainMenu } from '../main-menu';
import { DnsStrategyRegistry } from '../../../domain/dns/strategies';
import { FieldConfig, FieldInputType } from '../../../domain/dns/strategies/field-config.interface';
import { TelegramErrorFormatter } from '../../../shared/core/errors/telegram.formatter';

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

  async showFieldSelector(ctx: SessionContext, recordIndex: number, useReply: boolean = false): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    const record = SessionValidator.getRecordByIndex(ctx, recordIndex);

    if (!zone || !record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }

    // Initialize or retrieve edit session
    if (!ctx.session.editSession || ctx.session.editSession.recordIndex !== recordIndex) {
      ctx.session.editSession = {
        recordIndex,
        pendingChanges: {},
      };
    }

    const strategy = this.strategyRegistry.getStrategy(record.type);
    const fieldConfigs = strategy.getFieldConfigs();

    const keyboard = this.buildFieldKeyboard(fieldConfigs, recordIndex);
    const message = this.formatFieldSelectorMessage(record, fieldConfigs, ctx.session.editSession.pendingChanges);

    if (useReply) {
      await ctx.reply(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } else {
      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    }
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

  async validateFieldInput(ctx: SessionContext, newValue: string): Promise<void> {
    const editField = ctx.session.editField;
    const editSession = ctx.session.editSession;

    if (!editField || !editSession) {
      await ctx.reply('❌ Edit session expired. Please try again.');
      return;
    }

    const fieldConfig = editField.fieldConfig as FieldConfig;
    
    // Parse input based on field type
    let parsedValue: unknown = newValue;
    if (fieldConfig.inputType === FieldInputType.NUMBER) {
      const num = Number(newValue);
      if (isNaN(num)) {
        await ctx.reply(`❌ Invalid number format. Please enter a valid number:`, { parse_mode: 'HTML' });
        return;
      }
      parsedValue = num;
    } else if (fieldConfig.inputType === FieldInputType.BOOLEAN) {
      parsedValue = newValue.toLowerCase() === 'true' || newValue === '1';
    }
    
    const validation = fieldConfig.validationSchema.safeParse(parsedValue);

    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid input';
      await ctx.reply(`❌ ${errorMessage}\n\nPlease try again:`, { parse_mode: 'HTML' });
      return;
    }

    // Directly save to pending changes without confirmation
    editSession.pendingChanges[fieldConfig.key] = validation.data;
    delete ctx.session.editField;

    await this.showFieldSelector(ctx, editSession.recordIndex, true);
  }


  async saveAllChanges(ctx: SessionContext): Promise<void> {
    const editSession = ctx.session.editSession;
    const zone = SessionValidator.getSelectedZone(ctx);
    const record = SessionValidator.getRecordByIndex(ctx, editSession!.recordIndex);

    if (!editSession || !zone || !record) {
      await ctx.reply('❌ Edit session expired. Please try again.');
      return;
    }

    if (Object.keys(editSession.pendingChanges).length === 0) {
      await ctx.editMessageText('⚠️ No changes to save.', { parse_mode: 'HTML' });
      return;
    }

    try {
      // Prepare update payload - exclude 'id' as it's passed separately
      const { id, ...recordWithoutId } = record;
      
      // Use strategy to apply field changes (handles nested structures like SRV)
      const strategy = this.strategyRegistry.getStrategy(record.type);
      const processedChanges = strategy.applyFieldChanges(record, editSession.pendingChanges);
      
      const updatedRecord = {
        ...recordWithoutId,
        ...processedChanges,
      };

      await this.gateway.updateDnsRecord(record.id, zone.zoneId, updatedRecord as any);

      const changesList = Object.entries(editSession.pendingChanges)
        .map(([key, value]) => `• <b>${key}</b>: <code>${value}</code>`)
        .join('\n');

      const successMessage = `✅ <b>DNS Record Updated!</b>\n\nChanges saved:\n${changesList}`;
      const keyboard = this.mainMenu.getMainMenuKeyboard();

      delete ctx.session.editSession;

      await ctx.editMessageText(successMessage, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      const errorMessage = TelegramErrorFormatter.format(error as Error);
      const keyboard = this.mainMenu.getMainMenuKeyboard();
      await ctx.reply(errorMessage, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
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

    keyboard.addButton('💾 Save All Changes', CallbackAction.DNS_SAVE_ALL, { idx: recordIndex });
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

  private formatFieldSelectorMessage(
    record: DnsRecord,
    fieldConfigs: FieldConfig[],
    pendingChanges: Record<string, unknown>
  ): string {
    const fieldList = fieldConfigs
      .map((f) => {
        const currentValue = this.getFieldCurrentValue(record, f.key);
        const hasPendingChange = f.key in pendingChanges;
        const indicator = hasPendingChange ? '✏️' : '•';
        
        if (hasPendingChange) {
          const newValue = pendingChanges[f.key];
          return `${indicator} <b>${f.label}:</b> ${currentValue || 'Not set'} → ${newValue}`;
        } else {
          return `${indicator} <b>${f.label}:</b> ${currentValue || 'Not set'}`;
        }
      })
      .join('\n');

    const changesCount = Object.keys(pendingChanges).length;
    const changesInfo = changesCount > 0 ? `\n\n📝 <b>${changesCount} pending change(s)</b>` : '';

    return `✏️ <b>Edit DNS Record</b>
<b>Type:</b> ${record.type}
<b>Name:</b> ${record.name}

<b>Current values:</b>
${fieldList}${changesInfo}

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
    // Use strategy to get field value (handles nested structures like SRV)
    const strategy = this.strategyRegistry.getStrategy(record.type);
    const value = strategy.getFieldValue(record, fieldKey);
    
    if (value === undefined || value === null) {
      return 'Not set';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  }
}
