import { IRegistrationRequestRepository, RequestId } from '@cloudflare-bot/domain';
import { ReviewRegistrationRequestDto, reviewRegistrationRequestDtoSchema } from '../../dto/registration-request.dto';
import { RegistrationRequestNotFoundError } from '../../errors/application.error';
import type { INotifier } from '../../ports/notifier.port';

export class RejectRegistrationRequestUseCase {
  constructor(
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

    request.reject(validated.reviewedBy);
    await this.registrationRequestRepository.save(request);

    try {
      await this.notifier.sendMessage(
        request.telegramId,
        '❌ <b>Access Denied</b>\n\nYour registration request has been rejected.',
        { parse_mode: 'HTML' }
      );
    } catch (error) {
      console.error('Failed to notify user about rejection:', error);
    }
  }
}
