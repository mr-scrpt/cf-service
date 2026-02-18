import { Bot, Context, SessionFlavor } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { SessionData } from '@shared/types';
import { logger } from '@shared/utils/logger';
import { env } from '@shared/config/env.config';
import { LifecycleManager } from '../process/lifecycle.manager';
import { BotInitializer, InitializationContext } from './initialization-context.interface';
import {
  DatabaseInitializer,
  SecurityInitializer,
  DomainInitializer,
  InfrastructureInitializer,
  ApplicationInitializer,
  RoutingInitializer,
  CommandsInitializer,
  LifecycleInitializer,
} from './initializers';
import { BotDIContainer } from '@infrastructure/di/bot-di-container';

type BotContext = Context & SessionFlavor<SessionData>;

export class BotApplication {
  private bot: Bot<BotContext>;
  private lifecycleManager: LifecycleManager;
  private botContainer: BotDIContainer;
  private initializers: BotInitializer[];

  constructor(private readonly container: DIContainer) {
    const telegramAdapter = this.container.getTelegramAdapter();
    this.bot = telegramAdapter.getBotTyped<BotContext>();
    this.lifecycleManager = new LifecycleManager();
    this.botContainer = new BotDIContainer();
    
    this.initializers = [
      new DatabaseInitializer(),
      new SecurityInitializer(),
      new DomainInitializer(),
      new InfrastructureInitializer(),
      new ApplicationInitializer(),
      new RoutingInitializer(),
      new CommandsInitializer(),
      new LifecycleInitializer(),
    ];
  }

  async initialize(): Promise<void> {
    const context: InitializationContext = {
      container: this.container,
      botContainer: this.botContainer,
      bot: this.bot,
      lifecycleManager: this.lifecycleManager,
    };

    for (const initializer of this.initializers) {
      await initializer.initialize(context);
    }
  }

  async start(): Promise<void> {
    const me: UserFromGetMe = await this.bot.api.getMe();
    logger.info('Bot started', { username: me.username, admin_id: env.ALLOWED_CHAT_ID });

    this.bot.start({
      onStart: () => logger.info('🚀 Cloudflare Management Bot is running with new architecture...'),
    });
  }
}
