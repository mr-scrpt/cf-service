import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { DomainFormatter } from '@infrastructure/ui/formatters/domain-formatter';
import { KeyboardBuilder } from '@infrastructure/ui/components';
import { SessionData } from '@shared/types';
import { TelegramErrorFormatter } from '@shared/core/errors/telegram.formatter';

type SessionContext = Context & SessionFlavor<SessionData>;

/**
 * List Domain Flow - displays all registered domains
 * Follows the same pattern as ListDnsFlow
 */
export class ListDomainFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly formatter: DomainFormatter
  ) {}

  async showDomainsList(ctx: SessionContext): Promise<void> {
    const keyboard = new KeyboardBuilder().addNavigation({ back: true });

    try {
      const domains = await this.gateway.listDomains();
      const message = this.formatter.formatDomainsList(domains);

      await ctx.editMessageText(message, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      const errorMessage = TelegramErrorFormatter.format(error as Error);
      await ctx.reply(errorMessage, {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    }
  }
}
