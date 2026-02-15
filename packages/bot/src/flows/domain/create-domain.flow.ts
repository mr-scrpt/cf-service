import { Context, SessionFlavor } from 'grammy';
import { DnsGatewayPort, domainNameSchema } from '@cloudflare-bot/shared';
import { WizardEngine, WizardConfig } from '../../wizard';
import { DomainFormatter } from '../../ui/formatters/domain-formatter';
import { MainMenu } from '../main-menu';
import { SessionData } from '../../types';
import { FieldInputType } from '../../strategies/field-config.interface';
import { TelegramErrorFormatter } from '../../core/errors/telegram-error-formatter';

type SessionContext = Context & SessionFlavor<SessionData>;

/**
 * Create Domain Flow - handles domain registration via wizard
 * Follows the same declarative pattern as CreateDnsFlow
 */
export class CreateDomainFlow {
  constructor(
    private readonly gateway: DnsGatewayPort,
    private readonly wizardEngine: WizardEngine,
    private readonly formatter: DomainFormatter,
    private readonly mainMenu: MainMenu
  ) {}

  async startWizard(ctx: SessionContext): Promise<void> {
    const config: WizardConfig = {
      steps: [
        {
          fieldConfig: {
            key: 'name',
            label: 'Domain Name',
            prompt: '🌐 Enter domain name:',
            required: true,
            inputType: FieldInputType.TEXT,
            validationSchema: domainNameSchema,
            placeholder: 'example.com',
            helpText: 'Enter your domain name without http:// or www',
          },
        },
      ],
      metadata: {},
      confirmationPrompt: '⚠️ Register this domain on Cloudflare?',
      onComplete: async (ctx, fields) => {
        await this.createDomain(ctx as SessionContext, fields.name as string);
      },
      onCancel: async (ctx) => {
        await ctx.reply('❌ Domain registration cancelled');
        await this.mainMenu.show(ctx as SessionContext);
      },
    };

    await this.wizardEngine.start(ctx, config);
  }

  private async createDomain(ctx: SessionContext, name: string): Promise<void> {
    try {
      const domain = await this.gateway.registerDomain({ name });
      
      const message = this.formatter.formatDomainRegistered(domain);
      await ctx.reply(message, { parse_mode: 'HTML' });
    } catch (error) {
      const errorMessage = TelegramErrorFormatter.format(error as Error);
      await ctx.reply(errorMessage, { parse_mode: 'HTML' });
    } finally {
      await this.mainMenu.show(ctx);
    }
  }
}
