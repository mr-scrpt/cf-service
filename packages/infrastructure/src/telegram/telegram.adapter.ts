import { Bot } from 'grammy';
import type { INotifier, ITelegramBot, TelegramUserInfo, ILogger } from '@cloudflare-bot/application';

export class TelegramAdapter implements INotifier, ITelegramBot {
  private bot: Bot;
  private logger?: ILogger;

  constructor(botToken: string, logger?: ILogger) {
    this.bot = new Bot(botToken);
    this.logger = logger;
  }

  getBot(): Bot {
    return this.bot;
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

  async getUserByUsername(username: string): Promise<TelegramUserInfo | null> {
    try {
      const usernameWithAt = username.startsWith('@') ? username : `@${username}`;
      
      this.logger?.debug('Attempting to get user by username', { username: usernameWithAt });
      
      const chat = await this.bot.api.getChat(usernameWithAt);
      
      this.logger?.debug('getChat response received', { 
        chatId: chat.id, 
        type: chat.type,
        username: chat.username 
      });
      
      if (chat.type !== 'private') {
        this.logger?.warn('Chat type is not private', { type: chat.type, username: usernameWithAt });
        return null;
      }

      return {
        id: chat.id,
        username: chat.username || username,
        firstName: chat.first_name || '',
        lastName: chat.last_name,
      };
    } catch (error) {
      this.logger?.error('Error getting user by username', {
        username,
        error: error instanceof Error ? error.message : String(error),
        errorDetails: error
      });
      return null;
    }
  }
}
