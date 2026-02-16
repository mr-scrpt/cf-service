import { DnsRecordType } from '../entities/dns-record.entity';

export const PROXIABLE_TYPES = [
  DnsRecordType.A,
  DnsRecordType.AAAA,
  DnsRecordType.CNAME,
] as const;

export type ProxiableRecordType = typeof PROXIABLE_TYPES[number];

export function isProxiable(type: DnsRecordType): type is ProxiableRecordType {
  return (PROXIABLE_TYPES as readonly DnsRecordType[]).includes(type);
}
