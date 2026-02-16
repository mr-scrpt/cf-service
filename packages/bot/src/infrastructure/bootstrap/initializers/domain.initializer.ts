import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { CloudflareGatewayAdapter } from '@cloudflare-bot/shared';
import { env } from '@shared/config/env.config';
import { createDnsStrategies } from '@domain/dns/strategies';

export class DomainInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.dependencies) {
      context.dependencies = {};
    }
    
    context.dependencies.cloudflareGateway = new CloudflareGatewayAdapter(env);
    context.dependencies.strategyRegistry = createDnsStrategies();
  }
}
