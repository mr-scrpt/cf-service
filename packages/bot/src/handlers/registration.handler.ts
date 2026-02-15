import { Context } from 'grammy';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { logger } from '../utils/logger';

export function createRegistrationHandlers(container: DIContainer) {
  return {
    async handleRequestAccess(ctx: Context) {
      try {
        await ctx.answerCallbackQuery();

        const userId = ctx.from?.id;
        const username = ctx.from?.username;
        const firstName = ctx.from?.first_name;
        const lastName = ctx.from?.last_name;

        if (!userId || !username || !firstName) {
          await ctx.editMessageText(
            '❌ <b>Error</b>\n\nCould not retrieve your user information.',
            { parse_mode: 'HTML' }
          );
          return;
        }

        const createRequestUseCase = container.getCreateRegistrationRequestUseCase();
        
        await createRequestUseCase.execute({
          telegramId: userId,
          username,
          firstName,
          lastName: lastName || null,
        });

        logger.info('Registration request created', { userId, username });

        await ctx.editMessageText(
          '✅ <b>Request Submitted</b>\n\n' +
          'Your access request has been submitted to the admin.\n\n' +
          'You will be notified once it\'s reviewed.',
          { parse_mode: 'HTML' }
        );
      } catch (error) {
        logger.error('Failed to create registration request', {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.from?.id,
        });

        await ctx.editMessageText(
          '❌ <b>Error</b>\n\nFailed to submit your request. Please try again later.',
          { parse_mode: 'HTML' }
        );
      }
    },
  };
}
