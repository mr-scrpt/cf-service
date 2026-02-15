import { IUserRepository } from '@cloudflare-bot/domain';

export class CheckUserAccessUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(telegramId: number): Promise<boolean> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    return user !== null && user.isAllowed();
  }
}
