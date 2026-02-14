import { Bot, Context, SessionFlavor, session } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { bootstrapDnsStrategies } from '../strategies';
import { SessionManager } from '../session';
import { WizardEngine, WizardValidator, WizardRenderer } from '../wizard';
import { PaginationComponent, KeyboardBuilder } from '../ui/components';
import { DnsRecordFormatter } from '../ui/formatters';
import { CreateDnsFlow, ListDnsFlow, DeleteDnsFlow } from '../flows';
import { CallbackRouter } from '../routing';
import { CallbackAction, BotEvent } from '../constants';
import {
  DnsManagementHandler,
  DnsCreateSelectTypeHandler,
  DnsSelectTypeHandler,
  DnsListDomainHandler,
  PageNavigationHandler,
  DnsDeleteSelectHandler,
  DnsDeleteConfirmHandler,
  WizardSelectOptionHandler,
  WizardSkipHandler,
  WizardConfirmHandler,
  NavigationCancelHandler,
} from '../handlers';
import { SessionData } from '../types';

export function bootstrapBot(bot: Bot<Context & SessionFlavor<SessionData>>, gateway: DnsGatewayPort) {
  bot.use(session({ initial: (): SessionData => ({}) }));

  const strategyRegistry = bootstrapDnsStrategies();
  const sessionManager = new SessionManager();
  const wizardValidator = new WizardValidator();
  const wizardRenderer = new WizardRenderer();
  const wizardEngine = new WizardEngine(sessionManager, wizardValidator, wizardRenderer);
  const pagination = new PaginationComponent();
  const formatter = new DnsRecordFormatter(strategyRegistry);

  const createFlow = new CreateDnsFlow(gateway, strategyRegistry, wizardEngine, formatter);
  const listFlow = new ListDnsFlow(gateway, formatter, pagination);
  const deleteFlow = new DeleteDnsFlow(gateway, formatter);

  const router = new CallbackRouter();

  router.registerAll([
    { action: CallbackAction.DNS_MANAGEMENT, handler: new DnsManagementHandler(createFlow) },
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
    {
      action: CallbackAction.WIZARD_SELECT_OPTION,
      handler: new WizardSelectOptionHandler(wizardEngine),
    },
    { action: CallbackAction.WIZARD_SKIP, handler: new WizardSkipHandler(wizardEngine) },
    { action: CallbackAction.WIZARD_CONFIRM, handler: new WizardConfirmHandler(wizardEngine) },
    { action: CallbackAction.NAV_CANCEL, handler: new NavigationCancelHandler(wizardEngine) },
  ]);

  bot.on(BotEvent.CALLBACK_QUERY, async (ctx) => {
    await router.route(ctx);
  });

  bot.on(BotEvent.MESSAGE_TEXT, async (ctx, next) => {
    const isWizardActive = await wizardEngine.isActive(ctx);
    if (isWizardActive) {
      await wizardEngine.handleTextInput(ctx, ctx.message.text);
    } else {
      await next();
    }
  });

  return { strategyRegistry, wizardEngine, createFlow, listFlow, deleteFlow, router };
}
