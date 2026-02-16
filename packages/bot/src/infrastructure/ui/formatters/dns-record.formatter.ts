import { DnsRecordType } from '@cloudflare-bot/domain';
import { DnsRecord } from '@cloudflare-bot/shared';
import { IDnsStrategyRegistry } from '@domain/dns/strategies/dns-strategy-registry.interface';
import { IDnsRecordFormatter } from './dns-record-formatter.interface';

export class DnsRecordFormatter implements IDnsRecordFormatter {
  constructor(private readonly strategyRegistry: IDnsStrategyRegistry) {}

  formatList(records: DnsRecord[]): string {
    if (records.length === 0) {
      return '📭 No DNS records found';
    }

    return records.map((record, i) => this.formatListItem(record, i)).join('\n\n');
  }

  formatListItem(record: DnsRecord, index: number): string {
    const strategy = this.strategyRegistry.getStrategy(record.type);
    return `${index + 1}. ${strategy.icon} ${record.name} (${record.type})`;
  }

  formatDetails(record: DnsRecord): string {
    const strategy = this.strategyRegistry.getStrategy(record.type);
    return strategy.formatSummary(record);
  }

  formatCreatedMessage(record: DnsRecord): string {
    return `✅ <b>DNS Record Created!</b>\n\n${this.formatDetails(record)}`;
  }

  formatUpdatedMessage(record: DnsRecord): string {
    return `✅ <b>DNS Record Updated!</b>\n\n${this.formatDetails(record)}`;
  }

  formatDeletedMessage(recordName: string, recordType: DnsRecordType): string {
    const strategy = this.strategyRegistry.getStrategy(recordType);
    return `✅ ${strategy.icon} <b>Record Deleted</b>\n\nName: <code>${recordName}</code>\nType: ${recordType}`;
  }
}
