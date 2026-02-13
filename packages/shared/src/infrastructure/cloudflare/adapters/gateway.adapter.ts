import Cloudflare from 'cloudflare';
import {
  RecordCreateParams,
  RecordUpdateParams,
  RecordResponse,
} from 'cloudflare/resources/dns/records';
import { Zone } from 'cloudflare/resources/zones/zones';
import { DnsGatewayPort } from '../../../domain/ports';
import { Domain, DnsRecord } from '../../../domain';
import { InfrastructureError } from '../../../errors/infrastructure.error';
import { CommonEnv } from '../../../config';
import {
  RegisterDomainInput,
  CreateDnsRecordInput,
  UpdateDnsRecordInput,
} from '../../../validation';
import { DomainStatus, ZoneType } from '../../../domain/constants.domain';

/**
 * Cloudflare Gateway Adapter implementing DNS operations
 * Uses official Cloudflare TypeScript SDK with proper typing
 */
export class CloudflareGatewayAdapter implements DnsGatewayPort {
  private client: Cloudflare;
  private readonly accountId: string;

  constructor(private readonly env: CommonEnv) {
    this.client = new Cloudflare({
      apiToken: env.CLOUDFLARE_API_TOKEN,
    });
    this.accountId = env.CLOUDFLARE_ACCOUNT_ID;
  }

  async registerDomain(input: RegisterDomainInput): Promise<Domain> {
    try {
      // SDK correctly types the parameters
      const zone = await this.client.zones.create({
        account: { id: this.accountId },
        name: input.name,
        type: ZoneType.Full,
      });

      return this.mapZoneToDomain(zone);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to register domain');
    }
  }

  async listDomains(): Promise<Domain[]> {
    try {
      const zones = await this.client.zones.list({
        per_page: 50,
        account: { id: this.accountId },
      });

      return zones.result.map((zone) => this.mapZoneToDomain(zone));
    } catch (error: unknown) {
      this.handleError(error, 'Failed to list domains');
    }
  }

  async createDnsRecord(input: CreateDnsRecordInput): Promise<DnsRecord> {
    const { zoneId, ...recordData } = input;

    try {
      // SDK correctly envisions discriminated unions.
      // input remainder (recordData) is now strongly typed to match RecordCreateParams
      // except for snake_case vs camelCase differences if any (our schema uses 'content', 'name', 'ttl', 'proxied', 'priority', 'data' which match SDK)
      const params = {
        ...recordData,
        zone_id: zoneId,
      };

      const record = await this.client.dns.records.create(params);
      return this.mapRecordToDnsRecord(record, zoneId);
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create DNS record');
    }
  }

  async updateDnsRecord(
    recordId: string,
    zoneId: string,
    input: UpdateDnsRecordInput,
  ): Promise<DnsRecord> {
    try {
      // Use 'update' method (PUT semantics) which replaces the record.
      // We pass the full entity data as required by the schema change.
      // Casting to RecordUpdateParams because input.type comes from our domain enum
      // and SDK expects specific string literals in a discriminated union.
      const params = {
        ...input,
        zone_id: input.zoneId,
      };

      return this.mapRecordToDnsRecord(
        await this.client.dns.records.update(recordId, params),
        input.zoneId,
      );
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update DNS record');
    }
  }


  async deleteDnsRecord(recordId: string, zoneId: string): Promise<void> {
    try {
      await this.client.dns.records.delete(recordId, {
        zone_id: zoneId,
      });
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete DNS record');
    }
  }

  async listDnsRecords(zoneId: string): Promise<DnsRecord[]> {
    try {
      const response = await this.client.dns.records.list({
        zone_id: zoneId,
        per_page: 100,
      });

      return response.result.map((record) =>
        this.mapRecordToDnsRecord(record, zoneId),
      );
    } catch (error: unknown) {
      this.handleError(error, 'Failed to list DNS records');
    }
  }

  // --- Mappers ---

  /**
   * Maps Cloudflare Zone response to Domain entity
   * Using proper SDK types instead of 'any'
   */
  private mapZoneToDomain(zone: Zone): Domain {
    return {
      id: zone.id,
      name: zone.name,
      // Safe check for status, defaulting to Unknown if undefined (Cloudflare didn't return it)
      status: zone.status || DomainStatus.Unknown,
      nameservers: zone.name_servers ?? [],
    };
  }

  /**
   * Maps Cloudflare DNS Record to DnsRecord entity
   * SDK provides proper union types for all record types
   *
   * @param zoneId - The zone ID context (not always present in record response)
   */
  private mapRecordToDnsRecord(
    record: RecordResponse,
    zoneId: string,
  ): DnsRecord {
    return {
      ...record,
      zoneId: zoneId,
      // No cast needed for type either due to string union match
    } as unknown as DnsRecord;
  }

  /**
   * Enhanced error handler with better context
   */
  private handleError(error: unknown, context: string): never {
    // Handle Cloudflare API errors specifically
    if (error instanceof Cloudflare.APIError) {
      throw new InfrastructureError(
        `${context}: ${error.message}`,
        'CLOUDFLARE_API_ERROR',
        {
          status: error.status,
          statusText: error.name, // APIError name is usually status text
          headers: error.headers,
          error: error.error,
        },
      );
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new InfrastructureError(
      `${context}: ${message}`,
      'CLOUDFLARE_SDK_ERROR',
      { originalError: error },
    );
  }
}
