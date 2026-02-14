import { Context, SessionFlavor } from 'grammy';
import { KeyboardBuilder } from '../ui/components';
import { CallbackAction } from '../constants';
import { SessionData } from '../types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class MainMenu {
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
      .addButton('🏢 Domain Management', CallbackAction.DOMAIN_MANAGEMENT);
  }

  private formatMainMenuMessage(): string {
    return `👋 <b>Welcome to Cloudflare Management Bot!</b>

I can help you manage your Cloudflare resources.
Select a section:`;
  }
}
