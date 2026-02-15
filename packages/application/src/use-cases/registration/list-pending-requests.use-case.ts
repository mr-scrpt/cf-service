import { IRegistrationRequestRepository, RequestStatus } from '@cloudflare-bot/domain';
import { RegistrationRequestDto } from '../../dto/registration-request.dto';

export class ListPendingRequestsUseCase {
  constructor(
    private readonly registrationRequestRepository: IRegistrationRequestRepository
  ) {}

  async execute(): Promise<RegistrationRequestDto[]> {
    const requests = await this.registrationRequestRepository.findByStatus(RequestStatus.PENDING);

    return requests.map(request => ({
      id: request.id.toString(),
      telegramId: request.telegramId,
      username: request.username,
      firstName: request.firstName,
      lastName: request.lastName,
      status: request.status,
      requestedAt: request.requestedAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy,
    }));
  }
}
