import { Bot, Context, SessionFlavor } from 'grammy';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { SessionData } from '@shared/types';
import { LifecycleManager } from '../process/lifecycle.manager';
import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { IDnsStrategyRegistry, IWizardEngine } from '@application/ports';
import { ApplicationFlows } from './flows.configurator';
import { BotDIContainer } from '@infrastructure/di/bot-di-container';

export type BotContext = Context & SessionFlavor<SessionData>;

export interface InitializationContext {
  container: DIContainer;
  botContainer: BotDIContainer;
  bot: Bot<BotContext>;
  lifecycleManager: LifecycleManager;
  cloudflareGateway?: IDnsGatewayPort;
  strategyRegistry?: IDnsStrategyRegistry;
  wizardEngine?: IWizardEngine;
  flows?: ApplicationFlows;
}

export interface BotInitializer {
  initialize(context: InitializationContext): Promise<void>;
}
