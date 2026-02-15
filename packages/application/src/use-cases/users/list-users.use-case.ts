import { IUserRepository } from '@cloudflare-bot/domain';
import { UserDto } from '../../dto/add-user.dto';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    
    return users
      .filter(u => u.isAllowed())
      .map(u => ({
        id: u.id.toString(),
        telegramId: u.telegramId,
        username: u.username,
        isAllowed: u.isAllowed(),
        createdAt: u.createdAt,
      }));
  }
}
