import { DnsRecord } from '@cloudflare-bot/shared';
import type { DomainDto } from '@cloudflare-bot/application';

export interface IDnsRecordFormatter {
  formatList(records: DnsRecord[]): string;
  formatListItem(record: DnsRecord, index: number): string;
  formatCreatedMessage(record: DnsRecord): string;
}

export interface IDomainFormatter {
  formatDomainRegistered(domain: DomainDto): string;
  formatDomainsList(domains: DomainDto[]): string;
}
