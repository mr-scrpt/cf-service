import { Context, SessionFlavor } from 'grammy';
import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { DnsRecord } from '@cloudflare-bot/shared';
import { IDnsRecordFormatter, IMainMenu } from '@application/ports';
import { KeyboardBuilder, CommonButtons } from '@infrastructure/ui/components';
import { CallbackAction, FlowStep } from '@shared/constants';
import { SessionData } from '@shared/types';
import { SessionValidator } from '@application/services/session-validator';

type SessionContext = Context & SessionFlavor<SessionData>;

export class DeleteDnsFlow {
  constructor(
    private readonly gateway: IDnsGatewayPort,
    private readonly formatter: IDnsRecordFormatter,
    private readonly mainMenu: IMainMenu
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    const domains = await this.gateway.listDomains();

    if (domains.length === 0) {
      await ctx.reply('❌ No domains found. Please register a domain first.');
      return;
    }

    ctx.session.tempDomains = domains;
    const keyboard = this.buildDomainKeyboard(domains);

    await ctx.reply('🗑 <b>Delete DNS Record</b>\n\nSelect a domain:', {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildDomainKeyboard(domains: Array<{ name: string }>): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();
    domains.forEach((domain, index) => {
      keyboard.addButton(
        domain.name,
        CallbackAction.DNS_DELETE_SELECT,
        { idx: index, step: FlowStep.SELECT_RECORD }
      );
    });
    keyboard.addNavigation({ back: true });
    return keyboard;
  }

  async showRecordSelector(ctx: SessionContext): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    if (!zone) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }

    const records = await this.gateway.listDnsRecords(zone.zoneId) as DnsRecord[];

    if (records.length === 0) {
      await ctx.editMessageText('📭 No DNS records found for this domain.');
      return;
    }

    ctx.session.tempRecords = records;
    const keyboard = this.buildRecordKeyboard(records);
    const message = this.formatRecordListMessage(zone.zoneName);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildRecordKeyboard(records: DnsRecord[]): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();
    records.forEach((record, index) => {
      const label = this.formatter.formatListItem(record, index);
      keyboard.addButton(
        label,
        CallbackAction.DNS_DELETE_SELECT,
        { idx: index, step: FlowStep.CONFIRM }
      );
    });
    keyboard.addNavigation({ back: true, cancel: true });
    return keyboard;
  }

  private formatRecordListMessage(zoneName: string): string {
    return `
🗑 <b>Delete DNS Record</b>
🌐 Domain: <code>${zoneName}</code>

Select a record to delete:
    `.trim();
  }

  async showConfirmation(
    ctx: SessionContext,
    recordIndex: number,
    recordName: string,
    recordType: string
  ): Promise<void> {
    const zoneName = ctx.session.selectedZoneName;
    const keyboard = this.buildConfirmationKeyboard(recordIndex);
    const message = this.formatConfirmationMessage(zoneName || '', recordName, recordType);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildConfirmationKeyboard(recordIndex: number): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();
    keyboard.addButton(
      '⚠️ Yes, Delete',
      CallbackAction.DNS_DELETE_CONFIRM,
      { idx: recordIndex }
    );
    keyboard.addNavigation({ back: true, cancel: true });
    return keyboard;
  }

  private formatConfirmationMessage(
    zoneName: string,
    recordName: string,
    recordType: string
  ): string {
    return `
🗑 <b>Delete DNS Record - Confirmation</b>

🌐 Domain: <code>${zoneName}</code>
📝 Record: <code>${recordName}</code>
📋 Type: ${recordType}

⚠️ <b>Warning:</b> This action cannot be undone!

Are you sure you want to delete this record?
    `.trim();
  }

  async deleteRecord(ctx: SessionContext, recordIndex: number): Promise<void> {
    const zone = SessionValidator.getSelectedZone(ctx);
    const record = SessionValidator.getRecordByIndex(ctx, recordIndex);

    if (!zone || !record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }

    await this.gateway.deleteDnsRecord(record.id, zone.zoneId);

    const successMessage = this.formatRecordListMessage((zone as any).zoneName);
    const keyboard = this.mainMenu.getMainMenuKeyboard();

    await ctx.editMessageText(successMessage, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }
}
