import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { FlowsConfigurator } from '@infrastructure/bootstrap/flows.configurator';

export class ApplicationInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.dependencies) {
      context.dependencies = {};
    }
    
    const flowsConfigurator = new FlowsConfigurator();
    context.dependencies.flows = flowsConfigurator.createFlows(
      context.dependencies.cloudflareGateway,
      context.dependencies.strategyRegistry,
      context.dependencies.wizardEngine
    );
  }
}
