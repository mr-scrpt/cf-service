export enum DnsRecordType {
  A = 'A',
  AAAA = 'AAAA',
  CNAME = 'CNAME',
  MX = 'MX',
  TXT = 'TXT',
  SRV = 'SRV',
  NS = 'NS',
}

export class DnsRecord {
  private constructor(
    public readonly id: string,
    public readonly zoneId: string,
    public readonly type: DnsRecordType,
    public readonly name: string,
    public readonly content: string,
    public readonly ttl: number,
    public readonly proxied: boolean,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(params: {
    id: string;
    zoneId: string;
    type: DnsRecordType;
    name: string;
    content: string;
    ttl: number;
    proxied?: boolean;
  }): DnsRecord {
    return new DnsRecord(
      params.id,
      params.zoneId,
      params.type,
      params.name,
      params.content,
      params.ttl,
      params.proxied ?? false
    );
  }
}
