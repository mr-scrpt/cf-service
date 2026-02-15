import { User, UserId, IUserRepository } from '@cloudflare-bot/domain';
import { UserModel, UserDocument } from '../models/user.model';

export class MongoUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const doc = await UserModel.findById(id.toString());
    return doc ? this.toDomain(doc) : null;
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    const doc = await UserModel.findOne({ telegramId });
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find();
    return docs.map(doc => this.toDomain(doc));
  }

  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id.toString(),
      this.toPersistence(user),
      { upsert: true, new: true }
    );
  }

  async delete(id: UserId): Promise<void> {
    await UserModel.findByIdAndDelete(id.toString());
  }

  private toDomain(doc: UserDocument): User {
    return User.create({
      id: UserId.create(doc._id),
      telegramId: doc.telegramId,
      username: doc.username,
      isAllowed: doc.isAllowed,
    });
  }

  private toPersistence(user: User): Partial<UserDocument> {
    return {
      _id: user.id.toString(),
      telegramId: user.telegramId,
      username: user.username,
      isAllowed: user.isAllowed(),
      createdAt: user.createdAt,
    };
  }
}
