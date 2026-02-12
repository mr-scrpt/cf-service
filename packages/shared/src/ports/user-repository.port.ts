import type { User } from '../domain';
import type { CreateUserInput } from '../validation';

export interface IUserRepository {
  findByTelegramId(telegramId: number): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  updateAllowedStatus(telegramId: number, isAllowed: boolean): Promise<User | null>;
  delete(telegramId: number): Promise<boolean>;
}
