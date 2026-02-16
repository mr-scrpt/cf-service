import { IUserRepository, User, UserId } from '@cloudflare-bot/domain';
import { AddUserDto, UserDto, addUserDtoSchema } from '../../dto/add-user.dto';
import { UserAlreadyExistsError } from '../../errors/application.error';

export class AddUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: AddUserDto, telegramId: number): Promise<UserDto> {
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

    const userId = UserId.fromTelegramId(telegramId);
    const user = User.create({
      id: userId,
      telegramId: telegramId,
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
