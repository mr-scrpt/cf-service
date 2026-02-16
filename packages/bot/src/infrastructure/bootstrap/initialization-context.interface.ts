import { Bot, Context, SessionFlavor } from 'grammy';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { SessionData } from '@shared/types';
import { LifecycleManager } from '../process/lifecycle.manager';

export type BotContext = Context & SessionFlavor<SessionData>;

export interface InitializationContext {
  container: DIContainer;
  bot: Bot<BotContext>;
  lifecycleManager: LifecycleManager;
  dependencies?: {
    cloudflareGateway?: any;
    strategyRegistry?: any;
    wizardEngine?: any;
    flows?: any;
  };
}

export interface BotInitializer {
  initialize(context: InitializationContext): Promise<void>;
}
