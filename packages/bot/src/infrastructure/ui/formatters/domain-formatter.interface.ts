import type { DomainDto } from '@cloudflare-bot/application';

export interface IDomainFormatter {
  formatDomainRegistered(domain: DomainDto): string;
  formatDomainsList(domains: DomainDto[]): string;
}
