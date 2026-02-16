import { Bot, Context, SessionFlavor } from 'grammy';
import { CallbackRouter, TextInputRouter, CallbackHandler } from '@infrastructure/routing';
import { CallbackAction, BotEvent } from '@shared/constants';
import { SessionData } from '@shared/types';
import { WizardEngine } from '@infrastructure/wizard';
import { ApplicationFlows } from './flows.configurator';
import {
  DnsManagementHandler,
  DnsCreateSelectDomainHandler,
  DnsCreateSelectTypeHandler,
  DnsSelectTypeHandler,
  DnsListDomainHandler,
  PageNavigationHandler,
  DnsDeleteSelectHandler,
  DnsDeleteConfirmHandler,
  DnsEditSelectHandler,
  DnsEditRecordHandler,
  DnsEditFieldHandler,
  DnsSaveAllHandler,
  DomainMenuHandler,
  DomainCreateHandler,
  DomainListHandler,
  WizardSelectOptionHandler,
  WizardSkipHandler,
  WizardConfirmHandler,
  NavigationCancelHandler,
  NavigationMainMenuHandler,
  NavigationBackHandler,
  RegistrationRequestHandler,
} from '@presentation/handlers';
import { DIContainer } from '@cloudflare-bot/infrastructure';

type BotContext = Context & SessionFlavor<SessionData>;

export class HandlersConfigurator {
  configureHandlers(
    flows: ApplicationFlows,
    wizardEngine: WizardEngine,
    container: DIContainer
  ) {
    const callbackRouter = new CallbackRouter();
    const textInputRouter = new TextInputRouter(wizardEngine, flows.editDnsFlow);

    const handlers: Array<{ action: CallbackAction; handler: CallbackHandler<unknown> }> = [
      { action: CallbackAction.MAIN_MENU, handler: new NavigationMainMenuHandler(flows.mainMenu) },
      { action: CallbackAction.DNS_MANAGEMENT, handler: new DnsManagementHandler(flows.dnsMenu) },
      { action: CallbackAction.DOMAIN_MANAGEMENT, handler: new DomainMenuHandler(flows.domainMenu) },
      { action: CallbackAction.DNS_CREATE_SELECT_DOMAIN, handler: new DnsCreateSelectDomainHandler(flows.createDnsFlow) },
      { action: CallbackAction.DNS_CREATE_SELECT_TYPE, handler: new DnsCreateSelectTypeHandler(flows.createDnsFlow) },
      { action: CallbackAction.DNS_SELECT_TYPE, handler: new DnsSelectTypeHandler(flows.createDnsFlow) },
      { action: CallbackAction.DNS_LIST_DOMAIN, handler: new DnsListDomainHandler(flows.listDnsFlow) },
      { action: CallbackAction.PAGE_NEXT, handler: new PageNavigationHandler(flows.listDnsFlow) },
      { action: CallbackAction.PAGE_PREV, handler: new PageNavigationHandler(flows.listDnsFlow) },
      { action: CallbackAction.DNS_DELETE_SELECT, handler: new DnsDeleteSelectHandler(flows.deleteDnsFlow) },
      { action: CallbackAction.DNS_DELETE_CONFIRM, handler: new DnsDeleteConfirmHandler(flows.deleteDnsFlow) },
      { action: CallbackAction.DNS_EDIT_SELECT_DOMAIN, handler: new DnsEditSelectHandler(flows.editDnsFlow) },
      { action: CallbackAction.DNS_EDIT_SELECT_RECORD, handler: new DnsEditRecordHandler(flows.editDnsFlow) },
      { action: CallbackAction.DNS_EDIT_FIELD, handler: new DnsEditFieldHandler(flows.editDnsFlow) },
      { action: CallbackAction.DNS_SAVE_ALL, handler: new DnsSaveAllHandler(flows.editDnsFlow) },
      { action: CallbackAction.DOMAIN_CREATE, handler: new DomainCreateHandler(flows.createDomainFlow) },
      { action: CallbackAction.DOMAIN_LIST, handler: new DomainListHandler(flows.listDomainFlow) },
      { action: CallbackAction.WIZARD_SELECT_OPTION, handler: new WizardSelectOptionHandler(wizardEngine) },
      { action: CallbackAction.WIZARD_SKIP, handler: new WizardSkipHandler(wizardEngine) },
      { action: CallbackAction.WIZARD_CONFIRM, handler: new WizardConfirmHandler(wizardEngine) },
      { action: CallbackAction.NAV_CANCEL, handler: new NavigationCancelHandler(wizardEngine) },
      { action: CallbackAction.NAV_BACK, handler: new NavigationBackHandler(flows.mainMenu) },
      { action: CallbackAction.NAV_MAIN_MENU, handler: new NavigationMainMenuHandler(flows.mainMenu) },
      { action: CallbackAction.REQUEST_ACCESS, handler: new RegistrationRequestHandler(container.getCreateRegistrationRequestUseCase()) },
    ];

    handlers.forEach(({ action, handler }) => {
      callbackRouter.register(action, handler);
    });

    return { callbackRouter, textInputRouter };
  }
}
