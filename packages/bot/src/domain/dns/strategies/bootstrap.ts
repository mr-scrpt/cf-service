import { DnsStrategyRegistry } from './dns-strategy.registry';
import {
  ARecordStrategy,
  AAAARecordStrategy,
  CNAMERecordStrategy,
  MXRecordStrategy,
  SRVRecordStrategy,
  TXTRecordStrategy,
  NSRecordStrategy,
} from './implementations';

export function bootstrapDnsStrategies(): DnsStrategyRegistry {
  const registry = new DnsStrategyRegistry();

  registry.registerAll([
    new ARecordStrategy(),
    new AAAARecordStrategy(),
    new CNAMERecordStrategy(),
    new MXRecordStrategy(),
    new SRVRecordStrategy(),
    new TXTRecordStrategy(),
    new NSRecordStrategy(),
  ]);

  return registry;
}
