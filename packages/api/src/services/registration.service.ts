import {
  CreateRegistrationRequestUseCase,
  ListPendingRequestsUseCase,
  ApproveRegistrationRequestUseCase,
  RejectRegistrationRequestUseCase,
  CreateRegistrationRequestDto,
  ReviewRegistrationRequestDto,
  RegistrationRequestDto,
  ILogger,
  Result,
} from '@cloudflare-bot/application';
import { BaseService } from './base.service';

export class RegistrationService extends BaseService {
  constructor(
    private readonly createRequestUseCase: CreateRegistrationRequestUseCase,
    private readonly listPendingRequestsUseCase: ListPendingRequestsUseCase,
    private readonly approveRequestUseCase: ApproveRegistrationRequestUseCase,
    private readonly rejectRequestUseCase: RejectRegistrationRequestUseCase,
    protected readonly logger: ILogger
  ) {
    super(logger);
  }

  async createRequest(dto: CreateRegistrationRequestDto): Promise<Result<RegistrationRequestDto>> {
    return this.execute(
      () => this.createRequestUseCase.execute(dto),
      'Create registration request',
      { username: dto.username }
    );
  }

  async listPending(): Promise<Result<RegistrationRequestDto[]>> {
    return this.execute(
      () => this.listPendingRequestsUseCase.execute(),
      'List pending requests'
    );
  }

  async approve(dto: ReviewRegistrationRequestDto): Promise<Result<void>> {
    return this.execute(
      () => this.approveRequestUseCase.execute(dto),
      'Approve registration request',
      { requestId: dto.requestId }
    );
  }

  async reject(dto: ReviewRegistrationRequestDto): Promise<Result<void>> {
    return this.execute(
      () => this.rejectRequestUseCase.execute(dto),
      'Reject registration request',
      { requestId: dto.requestId }
    );
  }
}
