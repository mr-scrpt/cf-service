import express from 'express';
import cors from 'cors';
import { DIContainer, loadConfig, connectDatabase } from '@cloudflare-bot/infrastructure';
import { createWebhookRoutes } from './routes/webhooks.routes';
import { createUserRoutes } from './routes/users.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error-handler.middleware';
import { API_PREFIX, ROUTES } from './constants/routes';

async function main() {
  const config = loadConfig();
  
  await connectDatabase(config.MONGODB_URI);
  
  const container = new DIContainer(config);
  
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.get(ROUTES.HEALTH, (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  app.use(API_PREFIX, createWebhookRoutes(container));
  
  app.use(API_PREFIX, authMiddleware(config.API_AUTH_TOKEN), createUserRoutes(container));
  
  app.use(errorHandler);
  
  const port = config.API_PORT;
  app.listen(port, () => {
    console.log(`✅ API Server running on port ${port}`);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start API server:', error);
  process.exit(1);
});
