import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { DomainFormatter } from '../../ui/formatters/domain-formatter';
import { KeyboardBuilder } from '../../ui/components';
import { SessionData } from '../../types';
import { ErrorMapper } from '../../core/errors/error-mapper';

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
      const errorMessage = ErrorMapper.toUserMessage(error as Error);
      await ctx.reply(errorMessage, {
        reply_markup: keyboard.build(),
      });
    }
  }
}
