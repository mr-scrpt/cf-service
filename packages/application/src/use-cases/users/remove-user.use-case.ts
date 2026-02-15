import { IUserRepository } from '@cloudflare-bot/domain';
import { UserNotFoundError } from '../../errors/application.error';

export class RemoveUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(telegramId: number): Promise<void> {
    const user = await this.userRepository.findByTelegramId(telegramId);
    
    if (!user) {
      throw new UserNotFoundError(`telegram_${telegramId}`);
    }
    
    await this.userRepository.delete(user.id);
  }
}
