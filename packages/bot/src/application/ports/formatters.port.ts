import { type DnsRecordData } from '@cloudflare-bot/domain';
import type { DomainDto } from '@cloudflare-bot/application';

export interface IDnsRecordFormatter {
  formatList(records: DnsRecordData[]): string;
  formatListItem(record: DnsRecordData, index: number): string;
  formatCreatedMessage(record: DnsRecordData): string;
}

export interface IDomainFormatter {
  formatDomainRegistered(domain: DomainDto): string;
  formatDomainsList(domains: DomainDto[]): string;
}
