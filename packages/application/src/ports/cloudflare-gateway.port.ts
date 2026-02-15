import { Domain, DnsRecord, DomainName } from '@cloudflare-bot/domain';

export interface ICloudflareGateway {
  createZone(domainName: DomainName): Promise<Domain>;
  
  createDnsRecord(params: {
    zoneId: string;
    type: string;
    name: string;
    content: string;
    ttl: number;
    proxied?: boolean;
  }): Promise<DnsRecord>;
  
  updateDnsRecord(params: {
    zoneId: string;
    recordId: string;
    type?: string;
    name?: string;
    content?: string;
    ttl?: number;
    proxied?: boolean;
  }): Promise<DnsRecord>;
  
  deleteDnsRecord(zoneId: string, recordId: string): Promise<void>;
  
  listDnsRecords(zoneId: string): Promise<DnsRecord[]>;
}
