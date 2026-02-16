import { DIContainer, loadConfig } from '@cloudflare-bot/infrastructure';
import { createApiLogger } from './config/logger.config';
import { ApiApplication } from './infrastructure/bootstrap';
import { env } from './config/env.config';

async function main() {
  const config = loadConfig();
  const logger = createApiLogger(env.NODE_ENV);
  const container = new DIContainer(config, logger);

  const app = new ApiApplication(container, env, logger);
  
  await app.initialize();
  await app.start();
}

main().catch((error) => {
  const logger = createApiLogger(env.NODE_ENV);
  logger.error('Failed to start API server', { error: error.message, stack: error.stack });
  process.exit(1);
});
