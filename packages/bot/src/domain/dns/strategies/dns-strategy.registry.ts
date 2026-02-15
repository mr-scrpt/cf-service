import { DnsRecordType } from '@cloudflare-bot/shared';
import { DnsRecordStrategy } from './dns-record-strategy.interface';

export class DnsStrategyRegistry {
  private strategies = new Map<DnsRecordType, DnsRecordStrategy>();

  register(strategy: DnsRecordStrategy): void {
    if (this.strategies.has(strategy.type)) {
      throw new Error(`Strategy for ${strategy.type} already registered`);
    }
    this.strategies.set(strategy.type, strategy);
  }

  registerAll(strategies: DnsRecordStrategy[]): void {
    strategies.forEach((s) => this.register(s));
  }

  getStrategy(type: DnsRecordType): DnsRecordStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No strategy registered for type: ${type}`);
    }
    return strategy;
  }

  getAllTypes(): DnsRecordType[] {
    return Array.from(this.strategies.keys());
  }

  getAll(): DnsRecordStrategy[] {
    return Array.from(this.strategies.values());
  }

  has(type: DnsRecordType): boolean {
    return this.strategies.has(type);
  }
}
