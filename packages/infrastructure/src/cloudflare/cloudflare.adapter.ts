import Cloudflare from 'cloudflare';
import type { Zone } from 'cloudflare/resources/zones/zones';
import type { Record as CloudflareSDKRecord } from 'cloudflare/resources/dns/records';
import { ICloudflareGateway } from '@cloudflare-bot/application';
import { Domain, DomainId, DomainName, DomainStatus, DnsRecord, DnsRecordType } from '@cloudflare-bot/domain';

export class CloudflareAdapter implements ICloudflareGateway {
  private client: Cloudflare;

  constructor(
    private readonly apiToken: string,
    private readonly accountId: string
  ) {
    this.client = new Cloudflare({ apiToken });
  }

  async createZone(domainName: DomainName): Promise<Domain> {
    try {
      const zone = await this.client.zones.create({
        account: { id: this.accountId },
        name: domainName.toString(),
        type: 'full',
      });

      return this.mapZoneToDomain(zone);
    } catch (error) {
      throw new Error(`Failed to create zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDnsRecord(params: {
    zoneId: string;
    type: string;
    name: string;
    content: string;
    ttl: number;
    proxied?: boolean;
  }): Promise<DnsRecord> {
    try {
      const record = await this.client.dns.records.create({
        zone_id: params.zoneId,
        type: params.type as any,
        name: params.name,
        content: params.content,
        ttl: params.ttl,
        proxied: params.proxied ?? false,
      });

      return this.mapRecordToDomain(record, params.zoneId);
    } catch (error) {
      throw new Error(`Failed to create DNS record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDnsRecord(params: {
    zoneId: string;
    recordId: string;
    type?: string;
    name?: string;
    content?: string;
    ttl?: number;
    proxied?: boolean;
  }): Promise<DnsRecord> {
    try {
      const updateParams: any = {
        zone_id: params.zoneId,
      };
      if (params.type) updateParams.type = params.type;
      if (params.name) updateParams.name = params.name;
      if (params.content) updateParams.content = params.content;
      if (params.ttl) updateParams.ttl = params.ttl;
      if (params.proxied !== undefined) updateParams.proxied = params.proxied;

      const record = await this.client.dns.records.update(params.recordId, updateParams);

      return this.mapRecordToDomain(record, params.zoneId);
    } catch (error) {
      throw new Error(`Failed to update DNS record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteDnsRecord(zoneId: string, recordId: string): Promise<void> {
    try {
      await this.client.dns.records.delete(recordId, { zone_id: zoneId });
    } catch (error) {
      throw new Error(`Failed to delete DNS record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listDnsRecords(zoneId: string): Promise<DnsRecord[]> {
    try {
      const response = await this.client.dns.records.list({ zone_id: zoneId });
      
      return response.result.map(record => this.mapRecordToDomain(record, zoneId));
    } catch (error) {
      throw new Error(`Failed to list DNS records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapZoneToDomain(zone: Zone): Domain {
    return Domain.create({
      id: DomainId.create(zone.id),
      name: DomainName.create(zone.name),
      nsServers: zone.name_servers,
      zoneId: zone.id,
    });
  }

  private mapRecordToDomain(record: CloudflareSDKRecord, zoneId: string): DnsRecord {
    return DnsRecord.create({
      id: record.id!,
      zoneId: zoneId,
      type: record.type as DnsRecordType,
      name: record.name,
      content: String(record.content),
      ttl: record.ttl!,
      proxied: ('proxied' in record ? (record.proxied ?? false) : false),
    });
  }
}
