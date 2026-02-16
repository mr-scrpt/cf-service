import { CallbackHandler, SessionContext } from '@infrastructure/routing/callback-handler.interface';
import { logger } from '@shared/utils/logger';
import { CreateRegistrationRequestUseCase } from '@cloudflare-bot/application';

export class RegistrationRequestHandler implements CallbackHandler<void> {
  constructor(private readonly createRequestUseCase: CreateRegistrationRequestUseCase) {}

  async handle(ctx: SessionContext): Promise<void> {
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

    try {
      await this.createRequestUseCase.execute({
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
        userId, 
        username, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      await ctx.editMessageText(
        '❌ <b>Error</b>\n\n' +
        'Failed to submit your request. Please try again later.\n\n' +
        `<code>${error instanceof Error ? error.message : 'Unknown error'}</code>`,
        { parse_mode: 'HTML' }
      );
    }
  }
}
