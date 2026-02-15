import { Bot, session, Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { bootstrapDnsStrategies } from '@domain/dns/strategies';
import { SessionManager } from '@services/session';
import { WizardEngine, WizardValidator, WizardRenderer } from '@infrastructure/wizard';
import { PaginationComponent, KeyboardBuilder } from '@infrastructure/ui/components';
import { DnsRecordFormatter, DomainFormatter } from '@infrastructure/ui/formatters';
import { CreateDnsFlow, DeleteDnsFlow, ListDnsFlow, EditDnsFlow, MainMenu, DnsMenu, DomainMenu, CreateDomainFlow, ListDomainFlow } from '@application/flows';
import { CallbackRouter, TextInputRouter } from '@infrastructure/routing';
import { CallbackAction, BotEvent } from '@shared/constants';
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
import { SessionData } from '@shared/types';
import { DIContainer } from '@cloudflare-bot/infrastructure';

export function bootstrapBot(
  bot: Bot<Context & SessionFlavor<SessionData>>, 
  gateway: DnsGatewayPort,
  container: DIContainer
) {
  bot.use(session({ initial: (): SessionData => ({}) }));

  const strategyRegistry = bootstrapDnsStrategies();
  const sessionManager = new SessionManager();
  const wizardValidator = new WizardValidator();
  const wizardRenderer = new WizardRenderer();
  const wizardEngine = new WizardEngine(sessionManager, wizardValidator, wizardRenderer);
  const pagination = new PaginationComponent();
  const formatter = new DnsRecordFormatter(strategyRegistry);
  const domainFormatter = new DomainFormatter();

  const mainMenu = new MainMenu();
  const dnsMenu = new DnsMenu();
  const domainMenu = new DomainMenu();
  const createFlow = new CreateDnsFlow(gateway, strategyRegistry, wizardEngine, formatter, mainMenu);
  const listFlow = new ListDnsFlow(gateway, formatter, pagination);
  const deleteFlow = new DeleteDnsFlow(gateway, formatter, mainMenu);
  const editFlow = new EditDnsFlow(gateway, formatter, mainMenu, strategyRegistry);
  
  const createDomainFlow = new CreateDomainFlow(gateway, wizardEngine, domainFormatter, mainMenu);
  const listDomainFlow = new ListDomainFlow(gateway, domainFormatter);

  const callbackRouter = new CallbackRouter();
  const textInputRouter = new TextInputRouter(wizardEngine, editFlow);

  callbackRouter.registerAll([
    { action: CallbackAction.DNS_MANAGEMENT, handler: new DnsManagementHandler(dnsMenu) },
    { action: CallbackAction.DOMAIN_MANAGEMENT, handler: new DomainMenuHandler(domainMenu) },
    { action: CallbackAction.DOMAIN_CREATE, handler: new DomainCreateHandler(createDomainFlow) },
    { action: CallbackAction.DOMAIN_LIST, handler: new DomainListHandler(listDomainFlow) },
    {
      action: CallbackAction.DNS_CREATE_SELECT_DOMAIN,
      handler: new DnsCreateSelectDomainHandler(createFlow),
    },
    {
      action: CallbackAction.DNS_CREATE_SELECT_TYPE,
      handler: new DnsCreateSelectTypeHandler(createFlow),
    },
    { action: CallbackAction.DNS_SELECT_TYPE, handler: new DnsSelectTypeHandler(createFlow) },
    { action: CallbackAction.DNS_LIST_DOMAIN, handler: new DnsListDomainHandler(listFlow) },
    { action: CallbackAction.PAGE_NEXT, handler: new PageNavigationHandler(listFlow) },
    { action: CallbackAction.PAGE_PREV, handler: new PageNavigationHandler(listFlow) },
    { action: CallbackAction.DNS_DELETE_SELECT, handler: new DnsDeleteSelectHandler(deleteFlow) },
    {
      action: CallbackAction.DNS_DELETE_CONFIRM,
      handler: new DnsDeleteConfirmHandler(deleteFlow),
    },
    { action: CallbackAction.DNS_EDIT_SELECT_DOMAIN, handler: new DnsEditSelectHandler(editFlow) },
    { action: CallbackAction.DNS_EDIT_SELECT_RECORD, handler: new DnsEditRecordHandler(editFlow) },
    { action: CallbackAction.DNS_EDIT_FIELD, handler: new DnsEditFieldHandler(editFlow) },
    { action: CallbackAction.DNS_SAVE_ALL, handler: new DnsSaveAllHandler(editFlow) },
    {
      action: CallbackAction.WIZARD_SELECT_OPTION,
      handler: new WizardSelectOptionHandler(wizardEngine),
    },
    { action: CallbackAction.WIZARD_SKIP, handler: new WizardSkipHandler(wizardEngine) },
    { action: CallbackAction.WIZARD_CONFIRM, handler: new WizardConfirmHandler(wizardEngine) },
    { action: CallbackAction.NAV_CANCEL, handler: new NavigationCancelHandler(wizardEngine) },
    { action: CallbackAction.NAV_BACK, handler: new NavigationBackHandler(mainMenu) },
    { action: CallbackAction.NAV_MAIN_MENU, handler: new NavigationMainMenuHandler(mainMenu) },
    { 
      action: CallbackAction.REQUEST_ACCESS, 
      handler: new RegistrationRequestHandler(container.getCreateRegistrationRequestUseCase()) 
    },
  ]);

  bot.on(BotEvent.CALLBACK_QUERY, async (ctx: any) => {
    await callbackRouter.route(ctx);
  });

  bot.on(BotEvent.MESSAGE_TEXT, async (ctx: any, next) => {
    const handled = await textInputRouter.route(ctx, ctx.message.text);
    if (!handled) {
      await next();
    }
  });

  return { strategyRegistry, wizardEngine, createFlow, listFlow, deleteFlow, editFlow, callbackRouter, textInputRouter };
}
