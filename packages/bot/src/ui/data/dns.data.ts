import { DnsRecordType } from '@cloudflare-bot/shared';

export interface DnsTypeUIConfig {
  type: DnsRecordType;
  label: string;
  group: 'common' | 'advanced';
  order: number;
}

export const DNS_TYPE_UI_CONFIG: DnsTypeUIConfig[] = [
  { type: DnsRecordType.A, label: 'A', group: 'common', order: 1 },
  { type: DnsRecordType.AAAA, label: 'AAAA', group: 'common', order: 2 },
  { type: DnsRecordType.CNAME, label: 'CNAME', group: 'common', order: 3 },
  { type: DnsRecordType.MX, label: 'MX', group: 'advanced', order: 4 },
  { type: DnsRecordType.TXT, label: 'TXT', group: 'advanced', order: 5 },
  { type: DnsRecordType.SRV, label: 'SRV', group: 'advanced', order: 6 },
];
