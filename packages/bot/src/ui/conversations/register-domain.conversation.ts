import { DnsGatewayPort, registerDomainSchema, ValidationError } from '@cloudflare-bot/shared';
import type { Conversation } from '@grammyjs/conversations';
import { formatDomainRegistered } from '../../commands/domain/domain-messages.template';
import { ErrorMapper } from '../../core/errors/error-mapper';
import { logger } from '../../utils/logger';

export function registerDomainConversationFactory(gateway: DnsGatewayPort) {
  return async function (conversation: Conversation<any>, ctx: any) {
    try {
      await ctx.reply('Введите домен (example.com):');
      const msg = await conversation.waitFor('message:text');
      const name = msg.message.text!.trim();

      const result = registerDomainSchema.safeParse({ name });
      if (!result.success) {
        await ctx.reply(ErrorMapper.toUserMessage(ValidationError.fromZod(result.error)));
        return;
      }

      logger.info('Attempting to register domain', { name });
      const domain = await gateway.registerDomain(result.data);
      logger.info('Domain registered successfully', { domain });
      await ctx.reply(formatDomainRegistered(domain), { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error in registerDomain conversation', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      await ctx.reply(ErrorMapper.toUserMessage(error as Error));
    }
  };
}
