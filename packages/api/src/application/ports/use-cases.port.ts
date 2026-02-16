import type {
  Result,
  CreateRegistrationRequestDto,
  RegistrationRequestDto,
  ReviewRegistrationRequestDto,
  AddUserDto,
  UserDto,
  WebhookPayloadDto,
} from '@cloudflare-bot/application';

export interface ICreateRegistrationRequestUseCase {
  execute(dto: CreateRegistrationRequestDto): Promise<Result<RegistrationRequestDto>>;
}

export interface IListPendingRequestsUseCase {
  execute(): Promise<Result<RegistrationRequestDto[]>>;
}

export interface IApproveRegistrationRequestUseCase {
  execute(dto: ReviewRegistrationRequestDto): Promise<Result<void>>;
}

export interface IRejectRegistrationRequestUseCase {
  execute(dto: ReviewRegistrationRequestDto): Promise<Result<void>>;
}

export interface IAddUserUseCase {
  execute(dto: AddUserDto): Promise<Result<UserDto>>;
}

export interface IListUsersUseCase {
  execute(): Promise<Result<UserDto[]>>;
}

export interface IRemoveUserUseCase {
  execute(telegramId: number): Promise<Result<void>>;
}

export interface ISendWebhookNotificationUseCase {
  execute(dto: WebhookPayloadDto): Promise<Result<void>>;
}
