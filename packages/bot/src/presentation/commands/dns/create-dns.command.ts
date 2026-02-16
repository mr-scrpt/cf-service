import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { CommandName } from '@shared/constants';
import { Context } from 'grammy';
import { BotCommand } from '../base/command.interface';

export class CreateDnsCommand implements BotCommand {
  readonly name = CommandName.DNS_CREATE;
  readonly description = 'Create DNS record';

  constructor(private readonly gateway: IDnsGatewayPort) {}

  async execute(ctx: Context): Promise<void> {
    await ctx.reply(
      '⚠️ This command is deprecated. Please use /start and select "DNS Management" from the menu.',
      { parse_mode: 'HTML' },
    );
  }
}
