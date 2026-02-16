import { DnsRecordType } from '@cloudflare-bot/domain';
import { DnsRecordStrategy } from './dns-record-strategy.interface';

export interface IDnsStrategyRegistry {
  register(strategy: DnsRecordStrategy): void;
  registerAll(strategies: DnsRecordStrategy[]): void;
  getStrategy(type: DnsRecordType): DnsRecordStrategy;
  getAll(): DnsRecordStrategy[];
  has(type: DnsRecordType): boolean;
}
