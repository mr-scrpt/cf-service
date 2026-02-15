import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, DnsRecordType } from '@cloudflare-bot/shared';
import { DnsStrategyRegistry } from '../../../domain/dns/strategies';
import { WizardEngine, WizardConfig } from '../../../infrastructure/wizard';
import { KeyboardBuilder } from '../../../infrastructure/ui/components';
import { CallbackAction } from '../../../shared/constants';
import { DnsRecordFormatter } from '../../../infrastructure/ui/formatters';
import { SessionData } from '../../../shared/types';
import { TelegramErrorFormatter } from '../../../shared/core/errors/telegram.formatter';
import { MainMenu } from '../main-menu';

type SessionContext = Context & SessionFlavor<SessionData>;

export class CreateDnsFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly strategyRegistry: DnsStrategyRegistry,
    private readonly wizardEngine: WizardEngine,
    private readonly formatter: DnsRecordFormatter,
    private readonly mainMenu: MainMenu
  ) {}

  async showDomainSelector(ctx: SessionContext): Promise<void> {
    try {
      const domains = await this.gateway.listDomains();

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

    const wizardConfig: WizardConfig = {
      steps: strategy.getFieldConfigs().map((fieldConfig) => ({
        fieldConfig,
      })),
      metadata: { zoneId, zoneName, type },
      confirmationPrompt: '⚠️ Создать DNS запись с этими данными?',
      onComplete: async (ctx: Context, fields: Record<string, unknown>) => {
        try {
          const input = strategy.toCreateInput({ zoneId, fields });
          const record = await this.gateway.createDnsRecord(input);

          const successMessage = this.formatter.formatCreatedMessage(record);
          const keyboard = this.mainMenu.getMainMenuKeyboard();

          await ctx.reply(successMessage, {
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
      onCancel: async (ctx: Context) => {
        await ctx.reply('❌ DNS record creation cancelled');
      },
    };

    await this.wizardEngine.start(ctx as SessionContext, wizardConfig);
  }
}
