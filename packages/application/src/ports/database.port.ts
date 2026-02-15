export interface IDatabaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}
