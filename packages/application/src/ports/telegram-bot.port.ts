export interface TelegramUserInfo {
  id: number;
  username: string;
  firstName: string;
  lastName?: string;
}

export interface ITelegramBot {
  getUserByUsername(username: string): Promise<TelegramUserInfo | null>;
}
