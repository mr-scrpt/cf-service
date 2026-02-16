import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { WizardEngine } from '@infrastructure/wizard';
import { DnsRecordFormatter, DomainFormatter } from '@infrastructure/ui/formatters';
import { PaginationComponent } from '@infrastructure/ui/components';
import { 
  CreateDnsFlow, 
  DeleteDnsFlow, 
  ListDnsFlow, 
  EditDnsFlow, 
  MainMenu, 
  DnsMenu, 
  DomainMenu, 
  CreateDomainFlow, 
  ListDomainFlow 
} from '@application/flows';
import { DnsStrategyRegistry } from '@domain/dns/strategies';

export interface ApplicationFlows {
  mainMenu: MainMenu;
  dnsMenu: DnsMenu;
  domainMenu: DomainMenu;
  createDnsFlow: CreateDnsFlow;
  listDnsFlow: ListDnsFlow;
  deleteDnsFlow: DeleteDnsFlow;
  editDnsFlow: EditDnsFlow;
  createDomainFlow: CreateDomainFlow;
  listDomainFlow: ListDomainFlow;
}

export class FlowsConfigurator {
  createFlows(
    gateway: DnsGatewayPort,
    strategyRegistry: DnsStrategyRegistry,
    wizardEngine: WizardEngine
  ): ApplicationFlows {
    const pagination = new PaginationComponent();
    const formatter = new DnsRecordFormatter(strategyRegistry);
    const domainFormatter = new DomainFormatter();

    const mainMenu = new MainMenu();
    const dnsMenu = new DnsMenu();
    const domainMenu = new DomainMenu();

    const createDnsFlow = new CreateDnsFlow(gateway, strategyRegistry, wizardEngine, formatter, mainMenu);
    const listDnsFlow = new ListDnsFlow(gateway, formatter, pagination);
    const deleteDnsFlow = new DeleteDnsFlow(gateway, formatter, mainMenu);
    const editDnsFlow = new EditDnsFlow(gateway, formatter, mainMenu, strategyRegistry);
    const createDomainFlow = new CreateDomainFlow(gateway, wizardEngine, domainFormatter, mainMenu);
    const listDomainFlow = new ListDomainFlow(gateway, domainFormatter);

    return {
      mainMenu,
      dnsMenu,
      domainMenu,
      createDnsFlow,
      listDnsFlow,
      deleteDnsFlow,
      editDnsFlow,
      createDomainFlow,
      listDomainFlow,
    };
  }
}
