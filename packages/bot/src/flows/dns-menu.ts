import { Context, SessionFlavor } from 'grammy';
import { KeyboardBuilder } from '../ui/components';
import { CallbackAction } from '../constants';
import { SessionData } from '../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class DnsMenu {
  async showMenu(ctx: SessionContext): Promise<void> {
    const keyboard = this.buildDnsMenuKeyboard();
    const message = this.formatDnsMenuMessage();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  private buildDnsMenuKeyboard(): KeyboardBuilder {
    return new KeyboardBuilder()
      .addButton('➕ Create DNS Record', CallbackAction.DNS_CREATE_SELECT_DOMAIN)
      .addButton('✏️ Edit DNS Record', CallbackAction.DNS_EDIT_SELECT_DOMAIN)
      .addButton('📋 List DNS Records', CallbackAction.DNS_LIST_DOMAIN)
      .addButton('🗑 Delete DNS Record', CallbackAction.DNS_DELETE_SELECT)
      .addNavigation({ back: true });
  }

  private formatDnsMenuMessage(): string {
    return `🌐 <b>DNS Management</b>

Manage your DNS records:
• Create new DNS records
• Edit existing records
• View all records
• Delete records

Select an action:`;
  }
}
