import { Bot, Context, SessionFlavor, session } from 'grammy';
import { SessionData } from '@shared/types';
import { createAuthGuard } from '@infrastructure/middleware/auth.middleware';
import { requestLoggerMiddleware } from '@infrastructure/middleware/request-logger.middleware';
import { createUsernameSyncMiddleware } from '@infrastructure/middleware/username-sync.middleware';
import { DIContainer } from '@cloudflare-bot/infrastructure';

type BotContext = Context & SessionFlavor<SessionData>;

export class MiddlewareConfigurator {
  configureMiddleware(bot: Bot<BotContext>, container: DIContainer) {
    bot.use(session({ initial: (): SessionData => ({}) }));
    bot.use(requestLoggerMiddleware);
    bot.use(createAuthGuard(container));
    bot.use(createUsernameSyncMiddleware(container));
  }
}
