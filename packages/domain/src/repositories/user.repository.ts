import { User } from '../entities/user.entity';
import { UserId } from '../value-objects/user-id.vo';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByTelegramId(telegramId: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}
