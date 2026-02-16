import cors from 'cors';
import express from 'express';
import { ApiInitializer, InitializationContext } from '../initialization-context.interface';
import { createRequestLoggerMiddleware } from '../../../middleware/request-logger.middleware';

export class MiddlewareInitializer implements ApiInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.app.use(cors());
    context.app.use(express.json());
    context.app.use(createRequestLoggerMiddleware(context.logger));
  }
}
