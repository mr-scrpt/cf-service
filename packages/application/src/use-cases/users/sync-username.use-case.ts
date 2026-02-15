import { IUserRepository } from '@cloudflare-bot/domain';

export class SyncUsernameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(telegramId: number, currentUsername: string | null): Promise<void> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      return;
    }
    
    if (user.username !== currentUsername) {
      user.updateUsername(currentUsername);
      await this.userRepository.save(user);
    }
  }
}
