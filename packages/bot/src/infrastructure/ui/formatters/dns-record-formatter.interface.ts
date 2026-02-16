import { DnsRecord } from '@cloudflare-bot/shared';

export interface IDnsRecordFormatter {
  formatList(records: DnsRecord[]): string;
  formatListItem(record: DnsRecord, index: number): string;
  formatCreatedMessage(record: DnsRecord): string;
}
