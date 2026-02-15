import { InvalidUserIdError } from '../errors/domain.error';

export class UserId {
  private constructor(private readonly value: string) {}

  static create(value: string): UserId {
    if (!value || value.trim().length === 0) {
      throw new InvalidUserIdError(value);
    }
    return new UserId(value);
  }

  static fromTelegramId(telegramId: number): UserId {
    return new UserId(`telegram_${telegramId}`);
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
