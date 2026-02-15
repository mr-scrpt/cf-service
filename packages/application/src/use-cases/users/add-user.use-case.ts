import { User, UserId, IUserRepository } from '@cloudflare-bot/domain';
import { AddUserDto, UserDto, addUserDtoSchema } from '../../dto/add-user.dto';

export class AddUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: AddUserDto): Promise<UserDto> {
    const validated = addUserDtoSchema.parse(dto);
    
    const existingUser = await this.userRepository.findByTelegramId(validated.telegramId);
    if (existingUser) {
      existingUser.allow();
      await this.userRepository.save(existingUser);
      return this.toDto(existingUser);
    }
    
    const userId = UserId.fromTelegramId(validated.telegramId);
    const user = User.create({
      id: userId,
      telegramId: validated.telegramId,
      username: validated.username,
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
