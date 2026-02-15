import { Schema, model } from 'mongoose';
import { RequestStatus } from '@cloudflare-bot/domain';

export interface IRegistrationRequestDocument {
  _id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string | null;
  status: RequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}

const registrationRequestSchema = new Schema<IRegistrationRequestDocument>({
  _id: { type: String, required: true },
  telegramId: { type: Number, required: true, unique: true, index: true },
  username: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, default: null },
  status: { 
    type: String, 
    enum: Object.values(RequestStatus),
    default: RequestStatus.PENDING,
    required: true,
    index: true
  },
  requestedAt: { type: Date, required: true, default: Date.now },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: String, default: null },
});

export const RegistrationRequestModel = model<IRegistrationRequestDocument>('RegistrationRequest', registrationRequestSchema);
