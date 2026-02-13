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
import {
  CLOUDFLARE_PAGE_SIZE,
  CLOUDFLARE_RETRY_CONFIG,
} from '../cloudflare.config';

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
        per_page: CLOUDFLARE_PAGE_SIZE.ZONES,
        account: { id: this.accountId },
      });

      return zones.result.map((zone) => this.mapZoneToDomain(zone));
    } catch (error: unknown) {
      this.handleError(error, 'Failed to list domains');
    }
  }

  async createDnsRecord(input: CreateDnsRecordInput): Promise<DnsRecord> {
    const { zoneId, ...recordData } = input;

    return this.withRetry(async () => {
      const params = {
        ...recordData,
        zone_id: zoneId,
      };

      const record = await this.client.dns.records.create(params);
      return this.mapRecordToDnsRecord(record, zoneId);
    }, 'Failed to create DNS record');
  }

  async updateDnsRecord(
    recordId: string,
    zoneId: string,
    input: UpdateDnsRecordInput,
  ): Promise<DnsRecord> {
    return this.withRetry(async () => {
      const params = {
        ...input,
        zone_id: input.zoneId,
      };

      return this.mapRecordToDnsRecord(
        await this.client.dns.records.update(recordId, params),
        input.zoneId,
      );
    }, 'Failed to update DNS record');
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
        per_page: CLOUDFLARE_PAGE_SIZE.DNS_RECORDS,
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
    } as unknown as DnsRecord;
  }

  /**
   * Retry wrapper for transient network errors with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    const { MAX_ATTEMPTS, RETRYABLE_STATUS_CODES, BASE_DELAY_MS } =
      CLOUDFLARE_RETRY_CONFIG;

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Only retry for transient errors
        if (error instanceof Cloudflare.APIError) {
          const isRetryable = RETRYABLE_STATUS_CODES.includes(
            error.status ?? 0,
          );

          if (isRetryable && attempt < MAX_ATTEMPTS) {
            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * BASE_DELAY_MS;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // Don't retry for non-transient errors
        break;
      }
    }

    this.handleError(lastError, context);
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
