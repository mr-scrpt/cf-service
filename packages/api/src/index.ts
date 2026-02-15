import express from 'express';
import cors from 'cors';
import { DIContainer, loadConfig, connectDatabase } from '@cloudflare-bot/infrastructure';
import { createWebhookRoutes } from './routes/webhooks.routes';
import { createUserRoutes } from './routes/users.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { createRequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { API_PREFIX, ROUTES } from './constants/routes';
import { createApiLogger } from './config/logger.config';
import { env } from './config/env.config';

async function main() {
  const config = loadConfig();
  
  const apiLogger = createApiLogger(env.NODE_ENV);
  const container = new DIContainer(config, apiLogger);
  
  await connectDatabase(env.MONGODB_URI);
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(createRequestLoggerMiddleware(apiLogger));
  
  app.get(ROUTES.HEALTH, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.use(API_PREFIX, createWebhookRoutes(container));
  
  app.use(API_PREFIX, authMiddleware(env.API_AUTH_TOKEN), createUserRoutes(container));
  
  app.use(errorHandler);
  
  const port = env.API_PORT;
  app.listen(port, () => {
    apiLogger.info('API Server started', { port, env: env.NODE_ENV });
  });
}

main().catch((error) => {
  const apiLogger = createApiLogger(env.NODE_ENV);
  apiLogger.error('Failed to start API server', { error: error.message, stack: error.stack });
  process.exit(1);
});
