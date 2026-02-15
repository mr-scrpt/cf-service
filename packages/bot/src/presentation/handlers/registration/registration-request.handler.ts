import { CallbackHandler, SessionContext } from '@infrastructure/routing/callback-handler.interface';
import { logger } from '@shared/utils/logger';

export class RegistrationRequestHandler implements CallbackHandler<void> {
  constructor(private readonly createRequestUseCase: any) {}

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
  }
}
