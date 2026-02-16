import { IDomainFormatter, IWizardEngine } from '@application/ports';
import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { domainNameSchema } from '@cloudflare-bot/domain';
import { FieldInputType } from '@domain/dns/strategies/field-config.interface';
import { WizardConfig } from '@infrastructure/wizard';
import { TelegramErrorFormatter } from '@shared/core/errors/telegram.formatter';
import { SessionData } from '@shared/types';
import { Context, SessionFlavor } from 'grammy';
import { MainMenuFlow } from '../main-menu.flow';

type SessionContext = Context & SessionFlavor<SessionData>;

/**
 * Create Domain Flow - handles domain registration via wizard
 * Follows the same declarative pattern as CreateDnsFlow
 */
export class CreateDomainFlow {
  constructor(
    private readonly gateway: IDnsGatewayPort,
    private readonly wizardEngine: IWizardEngine,
    private readonly formatter: IDomainFormatter,
    private readonly mainMenu: MainMenuFlow,
  ) {}

  async startWizard(ctx: SessionContext): Promise<void> {
    const config: WizardConfig<SessionContext> = {
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
        await this.createDomain(ctx, fields);
      },
      onCancel: async (ctx) => {
        await ctx.reply('❌ Domain registration cancelled');
        await this.mainMenu.show(ctx);
      },
    };

    await this.wizardEngine.start(ctx, config);
  }

  private async createDomain(ctx: SessionContext, fields: Record<string, unknown>): Promise<void> {
    try {
      const domain = await this.gateway.registerDomain({ domain: fields.name as string });
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
