import mongoose, { Schema } from 'mongoose';

export interface DomainDocument {
  _id: string;
  name: string;
  nsServers: string[];
  zoneId: string;
  status: 'PENDING' | 'ACTIVE' | 'FAILED';
  createdAt: Date;
}

const domainSchema = new Schema<DomainDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true, unique: true, index: true },
  nsServers: { type: [String], required: true },
  zoneId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
});

export const DomainModel = mongoose.model<DomainDocument>('Domain', domainSchema);
