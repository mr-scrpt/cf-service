import express from 'express';
import cors from 'cors';
import { createWebhookRoutes } from './routes/webhooks.routes';
import { createUserRoutes } from './routes/users.routes';
import { createRegistrationRoutes } from './routes/registration.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { createRequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { API_PREFIX, ROUTES } from './constants/routes';
import { bootstrapApplication } from './bootstrap/app.bootstrap';

async function main() {
  const { container, logger, env } = await bootstrapApplication();
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(createRequestLoggerMiddleware(logger));
  
  app.get(ROUTES.HEALTH, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.use(API_PREFIX, createWebhookRoutes(container));
  
  app.use(API_PREFIX, authMiddleware(env.API_AUTH_TOKEN), createUserRoutes(container));
  app.use(API_PREFIX, authMiddleware(env.API_AUTH_TOKEN), createRegistrationRoutes(container));
  
  app.use(errorHandler);
  
  const port = env.API_PORT;
  app.listen(port, () => {
    logger.info('API Server started', { port, env: env.NODE_ENV });
  });
}

main().catch(async (error) => {
  const { logger } = await bootstrapApplication();
  logger.error('Failed to start API server', { error: error.message, stack: error.stack });
  process.exit(1);
});
