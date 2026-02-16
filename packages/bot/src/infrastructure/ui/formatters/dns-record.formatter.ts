import { DnsRecordType, type DnsRecordData } from '@cloudflare-bot/domain';
import { IDnsStrategyRegistry, IDnsRecordFormatter } from '@application/ports';

export class DnsRecordFormatter implements IDnsRecordFormatter {
  constructor(private readonly strategyRegistry: IDnsStrategyRegistry) {}

  formatList(records: DnsRecordData[]): string {
    if (records.length === 0) {
      return '📭 No DNS records found';
    }

    return records.map((record, i) => this.formatListItem(record, i)).join('\n\n');
  }

  formatListItem(record: DnsRecordData, index: number): string {
    const strategy = this.strategyRegistry.getStrategy(record.type);
    return `${index + 1}. ${strategy.icon} ${record.name} (${record.type})`;
  }

  private formatRecordDetails(record: DnsRecordData): string {
    const strategy = this.strategyRegistry.getStrategy(record.type);
    return strategy.formatSummary(record);
  }

  formatDetails(record: DnsRecordData): string {
    return this.formatRecordDetails(record);
  }

  formatCreatedMessage(record: DnsRecordData): string {
    return `✅ <b>DNS Record Created!</b>\n\n${this.formatRecordDetails(record)}`;
  }

  formatUpdatedMessage(record: DnsRecordData): string {
    return `✅ <b>DNS Record Updated!</b>\n\n${this.formatDetails(record)}`;
  }

  formatDeletedMessage(recordName: string, recordType: DnsRecordType): string {
    const strategy = this.strategyRegistry.getStrategy(recordType);
    return `✅ ${strategy.icon} <b>Record Deleted</b>\n\nName: <code>${recordName}</code>\nType: ${recordType}`;
  }
}
