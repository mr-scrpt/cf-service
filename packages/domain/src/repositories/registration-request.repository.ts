import { RegistrationRequest, RequestStatus } from '../entities/registration-request.entity';
import { RequestId } from '../value-objects/request-id.vo';

export interface IRegistrationRequestRepository {
  save(request: RegistrationRequest): Promise<void>;
  findById(id: RequestId): Promise<RegistrationRequest | null>;
  findByTelegramId(telegramId: number): Promise<RegistrationRequest | null>;
  findPendingByTelegramId(telegramId: number): Promise<RegistrationRequest | null>;
  findByStatus(status: RequestStatus): Promise<RegistrationRequest[]>;
  delete(id: RequestId): Promise<void>;
}
