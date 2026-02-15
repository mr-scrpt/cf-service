import { DIContainer, loadConfig } from '@cloudflare-bot/infrastructure';
import { createApiLogger } from '../config/logger.config';
import { env } from '../config/env.config';

export async function bootstrapApplication() {
  const config = loadConfig();
  
  const logger = createApiLogger(env.NODE_ENV);
  const container = new DIContainer(config, logger);
  
  const dbService = container.getDatabaseService();
  await dbService.connect();
  
  return { container, logger, env };
}
