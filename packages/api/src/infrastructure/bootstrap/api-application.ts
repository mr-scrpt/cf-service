import express, { Application } from 'express';
import { Server } from 'http';
import { DIContainer } from '@cloudflare-bot/infrastructure';
import { ILogger } from '@cloudflare-bot/application';
import { ApiEnv } from '../../config/env.config';
import { ApiInitializer, InitializationContext } from './initialization-context.interface';
import {
  DatabaseInitializer,
  MiddlewareInitializer,
  RoutesInitializer,
  ErrorHandlerInitializer,
} from './initializers';

export class ApiApplication {
  private app: Application;
  private server?: Server;
  private initializers: ApiInitializer[];

  constructor(
    private readonly container: DIContainer,
    private readonly env: ApiEnv,
    private readonly logger: ILogger
  ) {
    this.app = express();
    
    this.initializers = [
      new DatabaseInitializer(),
      new MiddlewareInitializer(),
      new RoutesInitializer(),
      new ErrorHandlerInitializer(),
    ];
  }

  async initialize(): Promise<void> {
    const context: InitializationContext = {
      container: this.container,
      app: this.app,
      env: this.env,
      logger: this.logger,
    };

    for (const initializer of this.initializers) {
      await initializer.initialize(context);
    }
  }

  async start(): Promise<void> {
    const port = this.env.API_PORT;
    
    this.server = this.app.listen(port, () => {
      this.logger.info('API Server started', { port, env: this.env.NODE_ENV });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
      this.logger.info('API Server stopped');
    }
  }
}
