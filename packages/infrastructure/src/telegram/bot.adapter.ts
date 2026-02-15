import { Bot } from 'grammy';
import type { ITelegramBot, TelegramUserInfo } from '@cloudflare-bot/application';

export class TelegramBotAdapter implements ITelegramBot {
  private bot: Bot;

  constructor(botToken: string) {
    this.bot = new Bot(botToken);
  }

  async getUserByUsername(username: string): Promise<TelegramUserInfo | null> {
    try {
      const usernameWithAt = username.startsWith('@') ? username : `@${username}`;
      
      const chat = await this.bot.api.getChat(usernameWithAt);
      
      if (chat.type !== 'private') {
        return null;
      }

      return {
        id: chat.id,
        username: chat.username || username,
        firstName: chat.first_name || '',
        lastName: chat.last_name,
      };
    } catch (error) {
      return null;
    }
  }
}
