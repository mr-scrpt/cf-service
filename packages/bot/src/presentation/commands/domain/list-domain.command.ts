import { Context } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { BotCommand } from '../base/command.interface';
import { CommandName } from '../../../shared/constants';
import { TelegramErrorFormatter } from '../../../shared/core/errors/telegram.formatter';
import { formatDomainsList } from './domain-messages.template';

export class ListDomainsCommand implements BotCommand {
  readonly name = CommandName.LIST_DOMAINS;
  readonly description = 'List all registered domains';

  constructor(private readonly gateway: DnsGatewayPort) { }

  async execute(ctx: Context): Promise<void> {
    try {
      const domains = await this.gateway.listDomains();
      await ctx.reply(formatDomainsList(domains), { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(TelegramErrorFormatter.format(error as Error), { parse_mode: 'HTML' });
    }
  }
}
