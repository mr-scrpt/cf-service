import { DIContainer, loadConfig } from '@cloudflare-bot/infrastructure';
import { logger } from '@shared/utils/logger';
import { createBotLogger } from '@shared/config/logger.config';
import { BotApplication } from '@infrastructure/bootstrap';

async function main() {
  const config = loadConfig();
  const botLogger = createBotLogger(config.NODE_ENV);
  const container = new DIContainer(config, botLogger);

  const app = new BotApplication(container);
  
  await app.initialize();
  await app.start();
}

main().catch((error) => {
  logger.error('Failed to start bot', { error: error.message, stack: error.stack });
  process.exit(1);
});
