import { Context, SessionFlavor } from 'grammy';
import { KeyboardBuilder } from '../ui/components';
import { CallbackAction } from '../constants';
import { SessionData } from '../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class MainMenuFlow {
  async show(ctx: SessionContext): Promise<void> {
    const keyboard = this.buildMainMenuKeyboard();
    const message = this.formatMainMenuMessage();

    await ctx.editMessageText(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard.build(),
    });
  }

  getMainMenuKeyboard(): KeyboardBuilder {
    return this.buildMainMenuKeyboard();
  }

  private buildMainMenuKeyboard(): KeyboardBuilder {
    return new KeyboardBuilder()
      .addButton('🌐 DNS Management', CallbackAction.DNS_MANAGEMENT)
      .addButton('📋 List DNS Records', CallbackAction.DNS_LIST_DOMAIN)
      .addButton('🗑 Delete DNS Record', CallbackAction.DNS_DELETE_SELECT);
  }

  private formatMainMenuMessage(): string {
    return `👋 <b>Welcome to Cloudflare Management Bot!</b>

I can help you manage your DNS records and Domains easily.
Select an option below to get started:`;
  }
}
