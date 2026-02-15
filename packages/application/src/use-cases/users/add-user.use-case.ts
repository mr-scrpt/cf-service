import { User, UserId, IUserRepository } from '@cloudflare-bot/domain';
import { AddUserDto, UserDto, addUserDtoSchema } from '../../dto/add-user.dto';
import { UserAlreadyExistsError, UserNotFoundError } from '../../errors/application.error';
import type { ITelegramBot } from '../../ports/telegram-bot.port';

export class AddUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly telegramBot: ITelegramBot
  ) {}

  async execute(dto: AddUserDto): Promise<UserDto> {
    const validated = addUserDtoSchema.parse(dto);
    
    const existingUser = await this.userRepository.findByUsername(validated.username);
    
    if (existingUser) {
      if (existingUser.isAllowed()) {
        throw new UserAlreadyExistsError(existingUser.telegramId);
      }
      
      existingUser.allow();
      await this.userRepository.save(existingUser);
      return this.toDto(existingUser);
    }
    
    const telegramUser = await this.telegramBot.getUserByUsername(validated.username);
    
    if (!telegramUser) {
      throw new UserNotFoundError(validated.username);
    }
    
    const userId = UserId.fromTelegramId(telegramUser.id);
    const user = User.create({
      id: userId,
      telegramId: telegramUser.id,
      username: telegramUser.username,
    });
    
    user.allow();
    await this.userRepository.save(user);
    
    return this.toDto(user);
  }

  private toDto(user: User): UserDto {
    return {
      id: user.id.toString(),
      telegramId: user.telegramId,
      username: user.username,
      isAllowed: user.isAllowed(),
      createdAt: user.createdAt,
    };
  }
}
