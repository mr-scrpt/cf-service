import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class DomainInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.cloudflareGateway = context.container.getDnsGatewayAdapter();
    context.strategyRegistry = context.botContainer.getStrategyRegistry();
  }
}
