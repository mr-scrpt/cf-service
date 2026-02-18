import { SessionManager } from '@infrastructure/session/session-manager';
import { WizardEngine } from '@infrastructure/wizard/wizard-engine';
import { WizardValidator } from '@infrastructure/wizard/wizard-validator';
import { WizardRenderer } from '@infrastructure/wizard/wizard-renderer';
import { MiddlewareConfigurator } from '@infrastructure/bootstrap/middleware.configurator';
import { FlowsConfigurator } from '@infrastructure/bootstrap/flows.configurator';
import { HandlersConfigurator } from '@infrastructure/bootstrap/handlers.configurator';
import { createDnsStrategies } from '@domain/dns/strategies/strategies.factory';
import { DnsStrategyRegistry } from '@domain/dns/strategies/dns-strategy.registry';
import { CommandModule } from '@presentation/commands/base/command.module';
import { IDnsGatewayPort } from '@cloudflare-bot/application';

export class BotDIContainer {
  private sessionManager?: SessionManager;
  private wizardValidator?: WizardValidator;
  private wizardRenderer?: WizardRenderer;
  private wizardEngine?: WizardEngine;
  private strategyRegistry?: DnsStrategyRegistry;
  private middlewareConfigurator?: MiddlewareConfigurator;
  private flowsConfigurator?: FlowsConfigurator;
  private handlersConfigurator?: HandlersConfigurator;

  getSessionManager(): SessionManager {
    if (!this.sessionManager) {
      this.sessionManager = new SessionManager();
    }
    return this.sessionManager;
  }

  getWizardValidator(): WizardValidator {
    if (!this.wizardValidator) {
      this.wizardValidator = new WizardValidator();
    }
    return this.wizardValidator;
  }

  getWizardRenderer(): WizardRenderer {
    if (!this.wizardRenderer) {
      this.wizardRenderer = new WizardRenderer();
    }
    return this.wizardRenderer;
  }

  getWizardEngine(): WizardEngine {
    if (!this.wizardEngine) {
      this.wizardEngine = new WizardEngine(
        this.getSessionManager(),
        this.getWizardValidator(),
        this.getWizardRenderer()
      );
    }
    return this.wizardEngine;
  }

  getStrategyRegistry(): DnsStrategyRegistry {
    if (!this.strategyRegistry) {
      this.strategyRegistry = createDnsStrategies();
    }
    return this.strategyRegistry;
  }

  getMiddlewareConfigurator(): MiddlewareConfigurator {
    if (!this.middlewareConfigurator) {
      this.middlewareConfigurator = new MiddlewareConfigurator();
    }
    return this.middlewareConfigurator;
  }

  getFlowsConfigurator(): FlowsConfigurator {
    if (!this.flowsConfigurator) {
      this.flowsConfigurator = new FlowsConfigurator();
    }
    return this.flowsConfigurator;
  }

  getHandlersConfigurator(): HandlersConfigurator {
    if (!this.handlersConfigurator) {
      this.handlersConfigurator = new HandlersConfigurator();
    }
    return this.handlersConfigurator;
  }

  createCommandModule(gateway: IDnsGatewayPort): CommandModule<any> {
    return new CommandModule(gateway);
  }
}
