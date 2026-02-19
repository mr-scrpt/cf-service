import { Context, SessionFlavor } from 'grammy';
import { DnsRecordType } from '@cloudflare-bot/domain';
import { IDnsGatewayPort, CreateDnsRecordUseCase, ListDomainsUseCase } from '@cloudflare-bot/application';
import { IDnsStrategyRegistry, IWizardEngine, IDnsRecordFormatter, IMainMenu } from '@application/ports';
import { WizardConfig } from '@infrastructure/wizard';
import { KeyboardBuilder } from '@infrastructure/ui/components';
import { CallbackAction } from '@shared/constants';
import { SessionData } from '@shared/types';
import { TelegramErrorFormatter } from '@shared/core/errors/telegram.formatter';

type SessionContext = Context & SessionFlavor<SessionData>;

export class CreateDnsFlow {
  constructor(
    private readonly gateway: IDnsGatewayPort,
    private readonly createDnsRecordUseCase: CreateDnsRecordUseCase,
    private readonly listDomainsUseCase: ListDomainsUseCase,
    private readonly strategyRegistry: IDnsStrategyRegistry,
    private readonly wizardEngine: IWizardEngine,
    private readonly formatter: IDnsRecordFormatter,
    private readonly mainMenu: IMainMenu
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    try {
      const domains = await this.listDomainsUseCase.execute();

      if (domains.length === 0) {
        await ctx.reply('❌ No domains found. Please register a domain first.');
        return;
      }

      // Store domains in session to avoid callback_data size limit
      ctx.session.tempDomains = domains;

      const keyboard = new KeyboardBuilder();

      domains.forEach((domain, index) => {
        keyboard.addButton(
          `${domain.name}`,
          CallbackAction.DNS_CREATE_SELECT_TYPE,
          { idx: index }
        );
      });

      keyboard.addNavigation({ back: true, cancel: true });

      await ctx.reply('📋 <b>Create DNS Record</b>\n\nSelect a domain:', {
        parse_mode: 'HTML',
        reply_markup: keyboard.build(),
      });
    } catch (error) {
      const errorMessage = TelegramErrorFormatter.format(error as Error);
      await ctx.reply(errorMessage, { parse_mode: 'HTML' });
      await this.mainMenu.show(ctx as SessionContext);
    }
  }

  async showTypeSelector(ctx: SessionContext): Promise<void> {
    const zoneName = ctx.session.selectedZoneName;
    
    if (!zoneName) {
      await ctx.reply('❌ Domain not selected. Please try again.');
      return;
    }

    const keyboard = new KeyboardBuilder();

    this.strategyRegistry.getAll().forEach((strategy) => {
      keyboard.addButton(
        `${strategy.icon} ${strategy.displayName}`,
        CallbackAction.DNS_SELECT_TYPE,
        { type: strategy.type }
      );
    });

    keyboard.addNavigation({ back: true, cancel: true });

    const message = `
📋 <b>Create DNS Record</b>
🌐 Domain: <code>${zoneName}</code>

Select record type:
    `.trim();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  async startWizard(
    ctx: SessionContext,
    zoneId: string,
    zoneName: string,
    type: DnsRecordType
  ): Promise<void> {
    const strategy = this.strategyRegistry.getStrategy(type);

    const wizardConfig: WizardConfig<SessionContext> = {
      steps: strategy.getFieldConfigs().map((fieldConfig) => ({
        fieldConfig,
      })),
      metadata: { zoneId, zoneName, type },
      confirmationPrompt: '⚠️ Создать DNS запись с этими данными?',
      onComplete: async (ctx, collectedData) => {
        try {
          const createdRecord = await this.createDnsRecordUseCase.execute(strategy.toCreateInput({ zoneId, fields: collectedData }));
          const message = this.formatter.formatCreatedMessage(createdRecord);
          const keyboard = this.mainMenu.getMainMenuKeyboard();

          await ctx.reply(message, {
            parse_mode: 'HTML',
            reply_markup: keyboard.build(),
          });
        } catch (error) {
          const errorMessage = TelegramErrorFormatter.format(error as Error);
          const keyboard = this.mainMenu.getMainMenuKeyboard();
          await ctx.reply(errorMessage, {
            parse_mode: 'HTML',
            reply_markup: keyboard.build(),
          });
        }
      },
      onCancel: async (ctx) => {
        await ctx.reply('❌ DNS record creation cancelled');
      },
    };

    await this.wizardEngine.start(ctx, wizardConfig);
  }
}
