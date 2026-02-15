import { DnsRecord, DnsRecordType } from '@cloudflare-bot/shared';
import { DnsStrategyRegistry } from '@domain/dns/strategies';

export class DnsRecordFormatter {
  constructor(private readonly strategyRegistry: DnsStrategyRegistry) {}

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
