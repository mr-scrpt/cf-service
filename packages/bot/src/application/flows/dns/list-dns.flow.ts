import { Context, SessionFlavor } from 'grammy';
import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { IDnsRecordFormatter, IPaginationComponent } from '@application/ports';
import { KeyboardBuilder } from '@infrastructure/ui/components';
import { CallbackAction } from '@shared/constants';
import { SessionData } from '@shared/types';
import { PaginationBuilder } from './pagination-builder';

type SessionContext = Context & SessionFlavor<SessionData>;

export class ListDnsFlow {
  constructor(
    private readonly gateway: IDnsGatewayPort,
    private readonly formatter: IDnsRecordFormatter,
    private readonly pagination: IPaginationComponent
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    const domains = await this.gateway.listDomains();

    if (domains.length === 0) {
      await ctx.reply('❌ No domains found. Please register a domain first.');
      return;
    }

    ctx.session.tempDomains = domains;
    const keyboard = this.buildDomainKeyboard(domains);

    await ctx.reply('📋 <b>List DNS Records</b>\n\nSelect a domain:', {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildDomainKeyboard(domains: Array<{ name: string }>): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();
    domains.forEach((domain, index) => {
      keyboard.addButton(domain.name, CallbackAction.DNS_LIST_DOMAIN, { idx: index });
    });
    keyboard.addNavigation({ back: true });
    return keyboard;
  }

  async showRecords(ctx: SessionContext, page = 0): Promise<void> {
    const { selectedZoneId: zoneId, selectedZoneName: zoneName } = ctx.session;
    
    if (!zoneId || !zoneName) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    ctx.session.currentPage = page;
    const records = await this.gateway.listDnsRecords(zoneId);

    const result = this.pagination.paginate({
      items: records,
      pageSize: 10,
      currentPage: page,
      renderItem: (record, index) => this.formatter.formatListItem(record as any, index),
      renderEmpty: () => '📭 No DNS records found for this domain',
    });

    const keyboard = PaginationBuilder.buildPaginationButtons({
      hasNext: result.hasNext,
      hasPrev: result.hasPrev,
      currentPage: page,
    });
    keyboard.addNavigation({ back: true, mainMenu: true });

    const message = this.formatRecordsMessage(zoneName, result.message);

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private formatRecordsMessage(zoneName: string, recordsContent: string): string {
    return `
📋 <b>DNS Records</b>
🌐 Domain: <code>${zoneName}</code>

${recordsContent}
    `.trim();
  }

}
