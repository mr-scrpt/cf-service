import { UserId } from '../value-objects/user-id.vo';

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly telegramId: number,
    private _username: string,
    private _isAllowed: boolean,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(params: {
    id: UserId;
    telegramId: number;
    username: string;
  }): User {
    return new User(
      params.id,
      params.telegramId,
      params.username,
      false,
      new Date()
    );
  }

  static reconstruct(params: {
    id: UserId;
    telegramId: number;
    username: string;
    isAllowed: boolean;
    createdAt: Date;
  }): User {
    return new User(
      params.id,
      params.telegramId,
      params.username,
      params.isAllowed,
      params.createdAt
    );
  }

  get username(): string {
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

  updateUsername(newUsername: string): void {
    this._username = newUsername;
  }
}
