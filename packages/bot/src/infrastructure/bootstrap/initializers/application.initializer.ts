import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';

export class ApplicationInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.cloudflareGateway) {
      throw new Error('cloudflareGateway not initialized');
    }
    if (!context.strategyRegistry) {
      throw new Error('strategyRegistry not initialized');
    }
    if (!context.wizardEngine) {
      throw new Error('wizardEngine not initialized');
    }
    
    const flowsConfigurator = context.botContainer.getFlowsConfigurator();
    context.flows = flowsConfigurator.createFlows(
      context.cloudflareGateway,
      context.strategyRegistry,
      context.wizardEngine
    );
  }
}
