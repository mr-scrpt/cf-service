import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, DnsRecord } from '@cloudflare-bot/shared';
import { KeyboardBuilder } from '../../ui/components';
import { DnsRecordFormatter } from '../../ui/formatters';
import { CallbackAction, FlowStep } from '../../constants';
import { SessionData } from '../../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class DeleteDnsFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly formatter: DnsRecordFormatter
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    try {
      const domains = await this.gateway.listDomains();

      if (domains.length === 0) {
        await ctx.reply('❌ No domains found. Please register a domain first.');
        return;
      }

      ctx.session.tempDomains = domains;

      const keyboard = new KeyboardBuilder();

      domains.forEach((domain, index) => {
        keyboard.addButton(
          domain.name,
          CallbackAction.DNS_DELETE_SELECT,
          { idx: index, step: FlowStep.SELECT_RECORD }
        );
      });

      keyboard.addNavigation({ back: true });

      await ctx.reply('🗑 <b>Delete DNS Record</b>\n\nSelect a domain:', {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      await ctx.reply('❌ Failed to load domains. Please try again.');
      throw error;
    }
  }

  async showRecordSelector(
    ctx: SessionContext
  ): Promise<void> {
    const zoneId = ctx.session.selectedZoneId;
    const zoneName = ctx.session.selectedZoneName;
    
    if (!zoneId || !zoneName) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    try {
      const records = await this.gateway.listDnsRecords(zoneId);

      if (records.length === 0) {
        await ctx.editMessageText('📭 No DNS records found for this domain.');
        return;
      }

      ctx.session.tempRecords = records;

      const keyboard = new KeyboardBuilder();

      records.forEach((record, index) => {
        const strategy = this.formatter['strategyRegistry'].getStrategy(record.type);
        keyboard.addButton(
          `${strategy.icon} ${record.name} (${record.type})`,
          CallbackAction.DNS_DELETE_SELECT,
          {
            idx: index,
            step: FlowStep.CONFIRM,
          }
        );
      });

      keyboard.addNavigation({ back: true, cancel: true });

      const message = `
🗑 <b>Delete DNS Record</b>
🌐 Domain: <code>${zoneName}</code>

Select a record to delete:
      `.trim();

      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      await ctx.reply('❌ Failed to load DNS records. Please try again.');
      throw error;
    }
  }

  async showConfirmation(
    ctx: SessionContext,
    recordId: string,
    recordName: string,
    recordType: string
  ): Promise<void> {
    const zoneName = ctx.session.selectedZoneName;
    
    const keyboard = new KeyboardBuilder();

    keyboard.addButton(
      '⚠️ Yes, Delete',
      CallbackAction.DNS_DELETE_CONFIRM,
      { recordId }
    );

    keyboard.addNavigation({ back: true, cancel: true });

    const message = `
🗑 <b>Delete DNS Record - Confirmation</b>

🌐 Domain: <code>${zoneName}</code>
📝 Record: <code>${recordName}</code>
📋 Type: ${recordType}

⚠️ <b>Warning:</b> This action cannot be undone!

Are you sure you want to delete this record?
    `.trim();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  async deleteRecord(
    ctx: SessionContext,
    recordId: string
  ): Promise<void> {
    const zoneId = ctx.session.selectedZoneId;
    const records = ctx.session.tempRecords as DnsRecord[];
    const record = records?.find(r => r.id === recordId);
    
    if (!zoneId || !record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }
    
    const recordName = record.name;
    const recordType = record.type;
    try {
      await this.gateway.deleteDnsRecord(recordId, zoneId);

      const message = this.formatter.formatDeletedMessage(
        recordName,
        recordType as DnsRecord['type']
      );

      await ctx.editMessageText(message, { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(`❌ Failed to delete DNS record: ${(error as Error).message}`);
      throw error;
    }
  }
}
