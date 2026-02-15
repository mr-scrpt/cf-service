import { Result, AddUserUseCase, ListUsersUseCase, RemoveUserUseCase } from '@cloudflare-bot/application';
import type { ILogger, AddUserDto, UserDto } from '@cloudflare-bot/application';
import { BaseService } from './base.service';

export class UserService extends BaseService {
  constructor(
    private addUserUseCase: AddUserUseCase,
    private listUsersUseCase: ListUsersUseCase,
    private removeUserUseCase: RemoveUserUseCase,
    logger: ILogger
  ) {
    super(logger);
  }

  async addUser(dto: AddUserDto): Promise<Result<UserDto, Error>> {
    return this.execute(
      () => this.addUserUseCase.execute(dto),
      'Add user',
      { username: dto.username }
    );
  }

  async listUsers(): Promise<Result<UserDto[], Error>> {
    return this.execute(
      () => this.listUsersUseCase.execute(),
      'List users'
    );
  }

  async removeUser(telegramId: number): Promise<Result<void, Error>> {
    return this.execute(
      () => this.removeUserUseCase.execute(telegramId),
      'Remove user',
      { telegramId }
    );
  }
}
