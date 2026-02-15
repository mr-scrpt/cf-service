import { IUserRepository, IRegistrationRequestRepository, RegistrationRequest } from '@cloudflare-bot/domain';
import { CreateRegistrationRequestDto, RegistrationRequestDto, createRegistrationRequestDtoSchema } from '../../dto/registration-request.dto';
import { UserAlreadyExistsError } from '../../errors/application.error';

export class CreateRegistrationRequestUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationRequestRepository: IRegistrationRequestRepository
  ) {}

  async execute(dto: CreateRegistrationRequestDto): Promise<RegistrationRequestDto> {
    const validated = createRegistrationRequestDtoSchema.parse(dto);

    const existingUser = await this.userRepository.findByTelegramId(validated.telegramId);
    if (existingUser) {
      throw new UserAlreadyExistsError(validated.telegramId);
    }

    const existingRequest = await this.registrationRequestRepository.findPendingByTelegramId(validated.telegramId);
    if (existingRequest) {
      return this.toDto(existingRequest);
    }

    const request = RegistrationRequest.create({
      telegramId: validated.telegramId,
      username: validated.username,
      firstName: validated.firstName,
      lastName: validated.lastName,
    });

    await this.registrationRequestRepository.save(request);

    return this.toDto(request);
  }

  private toDto(request: RegistrationRequest): RegistrationRequestDto {
    return {
      id: request.id.toString(),
      telegramId: request.telegramId,
      username: request.username,
      firstName: request.firstName,
      lastName: request.lastName,
      status: request.status,
      requestedAt: request.requestedAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy,
    };
  }
}
