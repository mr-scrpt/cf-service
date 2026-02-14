import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { KeyboardBuilder, PaginationComponent } from '../../ui/components';
import { DnsRecordFormatter } from '../../ui/formatters';
import { CallbackAction } from '../../constants';
import { SessionData } from '../../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class ListDnsFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly formatter: DnsRecordFormatter,
    private readonly pagination: PaginationComponent
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
          CallbackAction.DNS_LIST_DOMAIN,
          { idx: index }
        );
      });

      keyboard.addNavigation({ back: true });

      await ctx.reply('📋 <b>List DNS Records</b>\n\nSelect a domain:', {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      await ctx.reply('❌ Failed to load domains. Please try again.');
      throw error;
    }
  }

  async showRecords(
    ctx: SessionContext,
    page = 0
  ): Promise<void> {
    const zoneId = ctx.session.selectedZoneId;
    const zoneName = ctx.session.selectedZoneName;
    
    if (!zoneId || !zoneName) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }
    
    ctx.session.currentPage = page;
    try {
      const records = await this.gateway.listDnsRecords(zoneId);

      const result = this.pagination.paginate({
        items: records,
        pageSize: 10,
        currentPage: page,
        renderItem: (record, index) => this.formatter.formatListItem(record, index),
        renderEmpty: () => '📭 No DNS records found for this domain',
      });

      const keyboard = new KeyboardBuilder();

      if (result.hasNext || result.hasPrev) {
        const paginationRow = [];

        if (result.hasPrev) {
          paginationRow.push({
            text: '⬅️ Previous',
            callback_data: this.serializeCallback(CallbackAction.PAGE_PREV, {
              page: page - 1,
            }),
          });
        }

        if (result.hasNext) {
          paginationRow.push({
            text: 'Next ➡️',
            callback_data: this.serializeCallback(CallbackAction.PAGE_NEXT, {
              page: page + 1,
            }),
          });
        }

        keyboard.addRow(paginationRow);
      }

      keyboard.addNavigation({ back: true, mainMenu: true });

      const message = `
📋 <b>DNS Records</b>
🌐 Domain: <code>${zoneName}</code>

${result.message}
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

  private serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }
}
