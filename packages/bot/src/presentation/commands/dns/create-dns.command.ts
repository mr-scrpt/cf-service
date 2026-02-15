import { Context } from 'grammy';
import {
  DnsGatewayPort,
  ValidationError,
  createDnsRecordSchema,
} from '@cloudflare-bot/shared';
import { BotCommand } from '../base/command.interface';
import { CommandName } from '@shared/constants';
import { TelegramErrorFormatter } from '@shared/core/errors/telegram.formatter';

export class CreateDnsCommand implements BotCommand {
  readonly name = CommandName.DNS_CREATE;
  readonly description = 'Create DNS record';

  constructor(private readonly gateway: DnsGatewayPort) { }

  async execute(ctx: Context): Promise<void> {
    await ctx.reply(
      '⚠️ This command is deprecated. Please use /start and select "DNS Management" from the menu.',
      { parse_mode: 'HTML' }
    );
  }
}
