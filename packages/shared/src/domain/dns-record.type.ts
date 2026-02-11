import { DnsRecordType } from './constants.domain';

export interface DnsRecord {
  id: string;
  zoneId: string;
  type: DnsRecordType;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}
