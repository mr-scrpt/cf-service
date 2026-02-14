import { Context } from 'grammy';
import {
  DnsGatewayPort,
  ValidationError,
  registerDomainSchema,
} from '@cloudflare-bot/shared';
import { BotCommand } from '../base/command.interface';
import { CommandName } from '../../constants';
import { ErrorMapper } from '../../core/errors/error-mapper';
import { formatDomainRegistered } from './domain-messages.template';

export class RegisterDomainCommand implements BotCommand {
  readonly name = CommandName.REGISTER_DOMAIN;
  readonly description = 'Add domain to Cloudflare';

  constructor(private readonly gateway: DnsGatewayPort) { }

  async execute(ctx: Context): Promise<void> {
    const match = typeof ctx.match === 'string' ? ctx.match.trim() : '';

    const result = registerDomainSchema.safeParse({ name: match });

    if (!result.success) {
      const error = ValidationError.fromZod(result.error);
      await ctx.reply(ErrorMapper.toUserMessage(error));
      return;
    }

    try {
      const domain = await this.gateway.registerDomain(result.data);
      await ctx.reply(formatDomainRegistered(domain), { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(ErrorMapper.toUserMessage(error as Error));
    }
  }
}
