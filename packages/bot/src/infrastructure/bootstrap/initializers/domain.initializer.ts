import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { createDnsStrategies } from '@domain/dns/strategies/strategies.factory';

export class DomainInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.cloudflareGateway = context.container.getDnsGatewayAdapter();
    context.strategyRegistry = createDnsStrategies();
  }
}
