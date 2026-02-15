import mongoose from 'mongoose';
import type { IDatabaseService } from '@cloudflare-bot/application';

export class MongooseDatabaseService implements IDatabaseService {
  constructor(private readonly uri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.uri);
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}
