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
