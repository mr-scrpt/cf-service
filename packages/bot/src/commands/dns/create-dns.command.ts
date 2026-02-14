import { Context } from 'grammy';
import {
  DnsGatewayPort,
  ValidationError,
  createDnsRecordSchema,
} from '@cloudflare-bot/shared';
import { BotCommand } from '../base/command.interface';
import { ErrorMapper } from '../../core/errors/error-mapper';
import { DnsCommandUsage, formatDnsRecordCreated } from './dns-messages.template';

export class CreateDnsCommand implements BotCommand {
  readonly name = 'dns_create';
  readonly description = 'Create DNS record';

  constructor(private readonly gateway: DnsGatewayPort) { }

  async execute(ctx: Context): Promise<void> {
    const match = typeof ctx.match === 'string' ? ctx.match : '';
    const args = match.trim().split(/\s+/);

    if (!args || args.length < 4 || !match) {
      await ctx.reply(DnsCommandUsage.create, { parse_mode: 'HTML' });
      return;
    }

    const [zoneId, type, name, content, ttl, proxied] = args;

    // Validate using proper schema from shared (supports A/AAAA/CNAME/MX/SRV)
    const result = createDnsRecordSchema.safeParse({
      zoneId,
      type: type.toUpperCase(),
      name,
      content,
      ttl: ttl ? parseInt(ttl, 10) : 3600,
      proxied: proxied === 'true' || false,
    });

    if (!result.success) {
      const error = ValidationError.fromZod(result.error);
      await ctx.reply(ErrorMapper.toUserMessage(error));
      return;
    }

    try {
      const record = await this.gateway.createDnsRecord(result.data);
      await ctx.reply(formatDnsRecordCreated(record), { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(ErrorMapper.toUserMessage(error as Error));
    }
  }
}
