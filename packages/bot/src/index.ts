// packages/bot/src/index.ts
import {
  createDnsRecordSchema,
  // Domain
  DnsRecordType,
  DomainStatus,
  // Config
  Environment,
  // Validation
  registerDomainSchema,
} from '@cloudflare-bot/shared';

import type {
  CreateDnsRecordInput,
  DnsRecord,
  Domain,
  // Ports
  IDnsGateway,
  // Validation DTOs
  RegisterDomainInput,
} from '@cloudflare-bot/shared';
import { env } from './config';

console.log(`Bot starting in ${env.NODE_ENV} mode...`);

// 1. Проверка Config
if (env.NODE_ENV === Environment.Production) {
  console.log('Production mode active');
}

// 2. Проверка Domain Enums
console.log('Enums:', DnsRecordType.A, DomainStatus.Active);

// 3. Проверка Validation & DTO
const domainInput: RegisterDomainInput = { name: 'example.com' };
const domainResult = registerDomainSchema.safeParse(domainInput);
console.log('Domain Validation:', domainResult.success);

const dnsInput: CreateDnsRecordInput = {
  zoneId: '123',
  type: DnsRecordType.CNAME,
  name: 'www',
  content: 'example.com',
};
const dnsResult = createDnsRecordSchema.safeParse(dnsInput);
console.log('DNS Validation:', dnsResult.success);

// 4. Проверка Портов (Типизация)
class MockDnsGateway implements IDnsGateway {
  async registerDomain(input: RegisterDomainInput): Promise<Domain> {
    return {
      id: 'mock-id',
      name: input.name,
      status: DomainStatus.Pending,
      nameservers: ['ns1.example.com'],
    };
  }

  async listDomains(): Promise<Domain[]> {
    return [];
  }

  async createDnsRecord(input: CreateDnsRecordInput): Promise<DnsRecord> {
    return {
      id: 'mock-dns-id',
      zoneId: input.zoneId,
      type: input.type,
      name: input.name,
      content: input.content,
      ttl: input.ttl ?? 1,
      proxied: input.proxied ?? false,
    };
  }

  async updateDnsRecord(): Promise<DnsRecord> {
    throw new Error('Not implemented');
  }
  async deleteDnsRecord(): Promise<void> {
    throw new Error('Not implemented');
  }
  async listDnsRecords(): Promise<DnsRecord[]> {
    return [];
  }
}

const gateway: IDnsGateway = new MockDnsGateway();
console.log('Gateway mock created successfully');
