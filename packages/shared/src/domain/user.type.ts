export interface User {
  id: string;
  telegramId: number;
  username: string;
  isAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
