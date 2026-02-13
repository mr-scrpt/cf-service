import { DnsGatewayPort } from '../../../domain/ports';
import { Domain, DnsRecord } from '../../../domain';
import { InfrastructureError } from '../../../errors/infrastructure.error';
import { CommonEnv } from '../../../config';
import {
  RegisterDomainInput,
  CreateDnsRecordInput,
  UpdateDnsRecordInput,
} from '../../../validation';
import { DomainStatus } from '../../../domain/constants.domain';

export class CloudflareGatewayAdapter implements DnsGatewayPort {
  constructor(private readonly env: CommonEnv) { }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.env.CLOUDFLARE_API_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data: any = await response.json();

    if (!response.ok || !data.success) {
      throw new InfrastructureError(
        `Cloudflare API Error: ${data.errors?.[0]?.message || 'Unknown error'}`,
        'CLOUDFLARE_ERROR',
        { status: response.status, errors: data.errors },
      );
    }

    return data.result as T;
  }

  async registerDomain(input: RegisterDomainInput): Promise<Domain> {
    const result = await this.request<any>('/zones', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        account: { id: this.env.CLOUDFLARE_ACCOUNT_ID },
        jump_start: true,
        type: 'full',
      }),
    });

    return {
      id: result.id,
      name: result.name,
      status: result.status as DomainStatus,
      nameservers: result.name_servers || [],
    };
  }

  async listDomains(): Promise<Domain[]> {
    const result = await this.request<any[]>('/zones?per_page=50');

    return result.map((zone) => ({
      id: zone.id,
      name: zone.name,
      status: zone.status as DomainStatus,
      nameservers: zone.name_servers || [],
    }));
  }

  async createDnsRecord(input: CreateDnsRecordInput): Promise<DnsRecord> {
    const { zoneId, ...payload } = input;
    const result = await this.request<any>(`/zones/${zoneId}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return this.mapDnsRecord(result);
  }

  async updateDnsRecord(
    recordId: string,
    zoneId: string,
    input: UpdateDnsRecordInput,
  ): Promise<DnsRecord> {
    const result = await this.request<any>(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });

    return this.mapDnsRecord(result);
  }

  async deleteDnsRecord(recordId: string, zoneId: string): Promise<void> {
    await this.request<any>(`/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'DELETE',
    });
  }

  async listDnsRecords(zoneId: string): Promise<DnsRecord[]> {
    const result = await this.request<any[]>(`/zones/${zoneId}/dns_records?per_page=100`);

    return result.map((record) => this.mapDnsRecord(record));
  }

  private mapDnsRecord(cfRecord: any): DnsRecord {
    return {
      id: cfRecord.id,
      zoneId: cfRecord.zone_id,
      type: cfRecord.type,
      name: cfRecord.name,
      content: cfRecord.content,
      ttl: cfRecord.ttl,
      proxied: cfRecord.proxied,
    };
  }
}
