import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, DnsRecordType } from '@cloudflare-bot/shared';
import { DnsStrategyRegistry } from '../../strategies';
import { WizardEngine, WizardConfig } from '../../wizard';
import { KeyboardBuilder } from '../../ui/components';
import { CallbackAction } from '../../constants';
import { DnsRecordFormatter } from '../../ui/formatters';
import { SessionData } from '../../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class CreateDnsFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly strategyRegistry: DnsStrategyRegistry,
    private readonly wizardEngine: WizardEngine,
    private readonly formatter: DnsRecordFormatter
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
      await ctx.reply('❌ Failed to load domains. Please try again.');
      throw error;
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
      onComplete: async (ctx: Context, fields: Record<string, unknown>) => {
        try {
          const input = strategy.toCreateInput({ zoneId, fields });
          const record = await this.gateway.createDnsRecord(input);

          const successMessage = this.formatter.formatCreatedMessage(record);
          
          const keyboard = new KeyboardBuilder()
            .addButton('🌐 DNS Management', CallbackAction.DNS_MANAGEMENT)
            .addButton('📋 List DNS Records', CallbackAction.DNS_LIST_DOMAIN)
            .addButton('🗑 Delete DNS Record', CallbackAction.DNS_DELETE_SELECT);

          await ctx.reply(successMessage, {
            parse_mode: 'HTML',
            reply_markup: keyboard.build(),
          });
        } catch (error) {
          await ctx.reply(`❌ Failed to create DNS record: ${(error as Error).message}`);
          throw error;
        }
      },
      onCancel: async (ctx: Context) => {
        await ctx.reply('❌ DNS record creation cancelled');
      },
    };

    await this.wizardEngine.start(ctx as SessionContext, wizardConfig);
  }
}
