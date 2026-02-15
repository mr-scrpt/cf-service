import { IUserRepository, IRegistrationRequestRepository, RequestId, User, UserId } from '@cloudflare-bot/domain';
import { ReviewRegistrationRequestDto, reviewRegistrationRequestDtoSchema } from '../../dto/registration-request.dto';
import { RegistrationRequestNotFoundError } from '../../errors/application.error';
import type { INotifier } from '../../ports/notifier.port';

export class ApproveRegistrationRequestUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationRequestRepository: IRegistrationRequestRepository,
    private readonly notifier: INotifier
  ) {}

  async execute(dto: ReviewRegistrationRequestDto): Promise<void> {
    const validated = reviewRegistrationRequestDtoSchema.parse(dto);

    const requestId = RequestId.fromString(validated.requestId);
    const request = await this.registrationRequestRepository.findById(requestId);

    if (!request) {
      throw new RegistrationRequestNotFoundError(validated.requestId);
    }

    request.approve(validated.reviewedBy);
    await this.registrationRequestRepository.save(request);

    const userId = UserId.fromTelegramId(request.telegramId);
    const user = User.create({
      id: userId,
      telegramId: request.telegramId,
      username: request.username,
    });

    user.allow();
    await this.userRepository.save(user);

    try {
      await this.notifier.sendMessage(
        request.telegramId,
        '✅ <b>Access Approved!</b>\n\nYour registration request has been approved. You can now use the bot.',
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Failed to notify user about approval:', error);
    }
  }
}
