import { IDnsGatewayPort, DomainDto, DnsRecordDto, CreateDnsRecordDto, UpdateDnsRecordDto, RegisterDomainDto } from '@cloudflare-bot/application';
import { ICloudflareGateway } from '@cloudflare-bot/application';
import { Domain, DnsRecord, DomainName, DnsRecordType } from '@cloudflare-bot/domain';

export class DnsGatewayAdapter implements IDnsGatewayPort {
  constructor(private readonly cloudflareClient: ICloudflareGateway) {}

  async registerDomain(input: RegisterDomainDto): Promise<DomainDto> {
    const domainName = DomainName.create(input.domain);
    const domain = await this.cloudflareClient.createZone(domainName);
    return this.mapDomainToDto(domain);
  }

  async listDomains(): Promise<DomainDto[]> {
    return [];
  }

  async createDnsRecord(input: CreateDnsRecordDto): Promise<DnsRecordDto> {
    const record = await this.cloudflareClient.createDnsRecord({
      zoneId: input.zoneId,
      type: input.type,
      name: input.name,
      content: input.content || '',
      ttl: input.ttl,
      proxied: input.proxied,
    });
    return this.mapDnsRecordToDto(record);
  }

  async updateDnsRecord(recordId: string, zoneId: string, input: UpdateDnsRecordDto): Promise<DnsRecordDto> {
    const record = await this.cloudflareClient.updateDnsRecord({
      recordId,
      zoneId,
      type: input.type,
      name: input.name,
      content: input.content,
      ttl: input.ttl,
      proxied: input.proxied,
    });
    return this.mapDnsRecordToDto(record);
  }

  async deleteDnsRecord(recordId: string, zoneId: string): Promise<void> {
    await this.cloudflareClient.deleteDnsRecord(zoneId, recordId);
  }

  async listDnsRecords(zoneId: string): Promise<DnsRecordDto[]> {
    const records = await this.cloudflareClient.listDnsRecords(zoneId);
    return records.map(r => this.mapDnsRecordToDto(r));
  }

  private mapDomainToDto(domain: Domain): DomainDto {
    return {
      id: domain.id.toString(),
      name: domain.name.toString(),
      status: domain.status as any,
      nameservers: domain.nsServers ?? [],
    };
  }

  private mapDnsRecordToDto(record: DnsRecord): DnsRecordDto {
    const baseRecord = {
      id: record.id,
      zoneId: record.zoneId,
      type: record.type as DnsRecordType,
      name: record.name,
      content: record.content,
      ttl: record.ttl,
      proxied: record.proxied,
    };
    
    if (record.type === DnsRecordType.MX && 'priority' in record) {
      return { ...baseRecord, priority: (record as any).priority };
    }
    
    if (record.type === DnsRecordType.SRV && 'data' in record) {
      return { ...baseRecord, data: (record as any).data };
    }
    
    return baseRecord;
  }
}
