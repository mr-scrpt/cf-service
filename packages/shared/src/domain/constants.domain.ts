export enum DnsRecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
  TXT = 'TXT',
  NS = 'NS',
  SRV = 'SRV',
}

export enum DomainStatus {
  Active = 'active',
  Pending = 'pending',
  Moved = 'moved',
  Deactivated = 'deactivated',
}
