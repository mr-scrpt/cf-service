import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { DnsGatewayAdapter, CloudflareClient } from '@cloudflare-bot/infrastructure';
import { env } from '@shared/config/env.config';
import { createDnsStrategies } from '@domain/dns/strategies/strategies.factory';

export class DomainInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.dependencies) {
      context.dependencies = {};
    }
    
    const cloudflareClient = new CloudflareClient(
      env.CLOUDFLARE_API_TOKEN,
      env.CLOUDFLARE_ACCOUNT_ID
    );
    
    context.dependencies.cloudflareGateway = new DnsGatewayAdapter(cloudflareClient);
    context.dependencies.strategyRegistry = createDnsStrategies();
  }
}
