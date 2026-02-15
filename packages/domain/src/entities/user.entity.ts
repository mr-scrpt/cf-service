import { UserId } from '../value-objects/user-id.vo';

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly telegramId: number,
    private _username: string | null,
    private _isAllowed: boolean,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(params: {
    id: UserId;
    telegramId: number;
    username?: string | null;
    isAllowed?: boolean;
  }): User {
    return new User(
      params.id,
      params.telegramId,
      params.username ?? null,
      params.isAllowed ?? false
    );
  }

  get username(): string | null {
    return this._username;
  }

  allow(): void {
    this._isAllowed = true;
  }

  deny(): void {
    this._isAllowed = false;
  }

  isAllowed(): boolean {
    return this._isAllowed;
  }

  updateUsername(newUsername: string | null): void {
    this._username = newUsername;
  }
}
