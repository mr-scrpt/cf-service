import { IRegistrationRequestRepository, RegistrationRequest, RequestId, RequestStatus } from '@cloudflare-bot/domain';
import { RegistrationRequestModel, IRegistrationRequestDocument } from '../models/registration-request.model';

export class MongoRegistrationRequestRepository implements IRegistrationRequestRepository {
  async save(request: RegistrationRequest): Promise<void> {
    const doc = this.toPersistence(request);
    await RegistrationRequestModel.findByIdAndUpdate(
      doc._id,
      doc,
      { upsert: true, new: true }
    );
  }

  async findById(id: RequestId): Promise<RegistrationRequest | null> {
    const doc = await RegistrationRequestModel.findById(id.toString());
    return doc ? this.toDomain(doc) : null;
  }

  async findByTelegramId(telegramId: number): Promise<RegistrationRequest | null> {
    const doc = await RegistrationRequestModel.findOne({ telegramId });
    return doc ? this.toDomain(doc) : null;
  }

  async findPendingByTelegramId(telegramId: number): Promise<RegistrationRequest | null> {
    const doc = await RegistrationRequestModel.findOne({ 
      telegramId,
      status: RequestStatus.PENDING 
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByStatus(status: RequestStatus): Promise<RegistrationRequest[]> {
    const docs = await RegistrationRequestModel.find({ status }).sort({ requestedAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async delete(id: RequestId): Promise<void> {
    await RegistrationRequestModel.findByIdAndDelete(id.toString());
  }

  private toDomain(doc: IRegistrationRequestDocument): RegistrationRequest {
    return RegistrationRequest.reconstruct({
      id: RequestId.fromString(doc._id),
      telegramId: doc.telegramId,
      username: doc.username,
      firstName: doc.firstName,
      lastName: doc.lastName,
      status: doc.status,
      requestedAt: doc.requestedAt,
      reviewedAt: doc.reviewedAt,
      reviewedBy: doc.reviewedBy,
    });
  }

  private toPersistence(request: RegistrationRequest): IRegistrationRequestDocument {
    return {
      _id: request.id.toString(),
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
