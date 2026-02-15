import { Bot } from 'grammy';
import { INotifier } from '@cloudflare-bot/application';

export class TelegramNotifierAdapter implements INotifier {
  private bot: Bot;

  constructor(botToken: string) {
    this.bot = new Bot(botToken);
  }

  async sendMessage(
    chatId: number,
    message: string,
    options?: { parse_mode?: 'HTML' | 'Markdown' }
  ): Promise<void> {
    try {
      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: options?.parse_mode,
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
