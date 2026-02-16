import { Application } from 'express';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { ILogger } from '@cloudflare-bot/application';
import { ApiEnv } from '../../config/env.config';

export interface InitializationContext {
  container: DIContainer;
  app: Application;
  env: ApiEnv;
  logger: ILogger;
}

export interface ApiInitializer {
  initialize(context: InitializationContext): Promise<void>;
}
