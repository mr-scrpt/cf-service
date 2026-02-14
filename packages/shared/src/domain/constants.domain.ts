// Single Source of Truth for DNS Record Types
export const DnsRecordType = {
  A: 'A',
  AAAA: 'AAAA',
  CNAME: 'CNAME',
  MX: 'MX',
  TXT: 'TXT',
  NS: 'NS',
  SRV: 'SRV',
} as const;

export type DnsRecordType = (typeof DnsRecordType)[keyof typeof DnsRecordType];

// Single Source of Truth for Domain Statuses
export const DomainStatus = {
  Active: 'active',
  Pending: 'pending',
  Initializing: 'initializing',
  Moved: 'moved',
  Deleted: 'deleted',
  Deactivated: 'deactivated',
  ReadOnly: 'read_only',
  Unknown: 'unknown',
} as const;

export type DomainStatus = (typeof DomainStatus)[keyof typeof DomainStatus];

// Single Source of Truth for Zone Types
export const ZoneType = {
  Full: 'full',
  Partial: 'partial',
} as const;

export type ZoneType = (typeof ZoneType)[keyof typeof ZoneType];

export const TTL_VALUES = {
  MIN: 60,
  MAX: 86400,
  AUTO: 1,
} as const;

/**
 * Proxiable DNS record types
 * Source of truth: DnsRecordType
 */
export const PROXIABLE_TYPES = [
  DnsRecordType.A,
  DnsRecordType.AAAA,
  DnsRecordType.CNAME,
] as const;

/**
 * Type automatically derived from PROXIABLE_TYPES
 */
export type ProxiableRecordType = typeof PROXIABLE_TYPES[number];

/**
 * Type guard for proxiable record types
 */
export function isProxiable(type: DnsRecordType): type is ProxiableRecordType {
  return (PROXIABLE_TYPES as readonly DnsRecordType[]).includes(type);
}

export const COMMON_TTL_VALUES = [
  { label: 'Auto', value: 1 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '30 min', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '2 hours', value: 7200 },
  { label: '5 hours', value: 18000 },
  { label: '12 hours', value: 43200 },
  { label: '1 day', value: 86400 },
] as const;
