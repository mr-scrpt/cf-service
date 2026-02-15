import mongoose, { Schema } from 'mongoose';

export interface UserDocument {
  _id: string;
  telegramId: number;
  username: string | null;
  isAllowed: boolean;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  _id: { type: String, required: true },
  telegramId: { type: Number, required: true, unique: true, index: true },
  username: { type: String, default: null },
  isAllowed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.model<UserDocument>('User', userSchema);
