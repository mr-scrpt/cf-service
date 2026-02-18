import { DIContainer } from '@cloudflare-bot/infrastructure';
import { loadConfig } from '@cloudflare-bot/infrastructure';
import { logger } from '@shared/utils/logger';
import { createBotLogger } from '@shared/config/logger.config';
import { BotApplication } from '@infrastructure/bootstrap';
import { BotDIContainer } from '@infrastructure/di/bot-di-container';

async function main() {
  const config = loadConfig();
  const botLogger = createBotLogger(config.NODE_ENV);
  
  const infraContainer = new DIContainer(config, botLogger);
  const botContainer = new BotDIContainer();

  const app = new BotApplication(infraContainer, botContainer);
  
  await app.initialize();
  await app.start();
}

main().catch((error) => {
  logger.error('Failed to start bot', { error: error.message, stack: error.stack });
  process.exit(1);
});
