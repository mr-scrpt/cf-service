import {
  CreateDnsFlow,
  CreateDomainFlow,
  DeleteDnsFlow,
  DnsMenuFlow,
  DomainMenuFlow,
  EditDnsFlow,
  ListDnsFlow,
  ListDomainFlow,
  MainMenuFlow,
} from '@application/flows';
import { IDnsStrategyRegistry, IWizardEngine } from '@application/ports';
import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { PaginationComponent } from '@infrastructure/ui/components';
import { DnsRecordFormatter, DomainFormatter } from '@infrastructure/ui/formatters';

export interface ApplicationFlows {
  mainMenu: MainMenuFlow;
  dnsMenu: DnsMenuFlow;
  domainMenu: DomainMenuFlow;
  createDnsFlow: CreateDnsFlow;
  listDnsFlow: ListDnsFlow;
  deleteDnsFlow: DeleteDnsFlow;
  editDnsFlow: EditDnsFlow;
  createDomainFlow: CreateDomainFlow;
  listDomainFlow: ListDomainFlow;
}

export class FlowsConfigurator {
  createFlows(
    gateway: IDnsGatewayPort,
    strategyRegistry: IDnsStrategyRegistry,
    wizardEngine: IWizardEngine,
  ): ApplicationFlows {
    const pagination = new PaginationComponent();
    const formatter = new DnsRecordFormatter(strategyRegistry);
    const domainFormatter = new DomainFormatter();

    const mainMenu = new MainMenuFlow();
    const dnsMenu = new DnsMenuFlow();
    const domainMenu = new DomainMenuFlow();

    const createDnsFlow = new CreateDnsFlow(
      gateway,
      strategyRegistry,
      wizardEngine,
      formatter,
      mainMenu,
    );
    const listDnsFlow = new ListDnsFlow(gateway, formatter, pagination);
    const deleteDnsFlow = new DeleteDnsFlow(gateway, formatter, mainMenu);
    const editDnsFlow = new EditDnsFlow(gateway, mainMenu, strategyRegistry);
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
