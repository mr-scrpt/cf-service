import { Context, SessionFlavor } from 'grammy';
import { KeyboardBuilder } from '../../infrastructure/ui/components';
import { CallbackAction } from '../../shared/constants';
import { SessionData } from '../../shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

/**
 * Domain Menu - entry point for domain management operations
 * Follows the same pattern as DnsMenu
 */
export class DomainMenu {
  async showMenu(ctx: SessionContext): Promise<void> {
    const keyboard = this.buildDomainMenuKeyboard();
    const message = this.formatDomainMenuMessage();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildDomainMenuKeyboard(): KeyboardBuilder {
    return new KeyboardBuilder()
      .addButton('➕ Register Domain', CallbackAction.DOMAIN_CREATE)
      .addButton('📋 List Domains', CallbackAction.DOMAIN_LIST)
      .addNavigation({ back: true });
  }

  private formatDomainMenuMessage(): string {
    return `🏢 <b>Domain Management</b>

Manage your Cloudflare domains:
• Register new domains
• View registered domains and NS servers

Select an action:`;
  }
}
