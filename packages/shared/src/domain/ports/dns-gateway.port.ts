import type { Domain, DnsRecord } from '..';
import type {
  RegisterDomainInput,
  CreateDnsRecordInput,
  UpdateDnsRecordInput,
} from '../../validation';

export interface IDnsGateway {
  registerDomain(input: RegisterDomainInput): Promise<Domain>;

  listDomains(): Promise<Domain[]>;

  createDnsRecord(input: CreateDnsRecordInput): Promise<DnsRecord>;

  updateDnsRecord(
    recordId: string,
    zoneId: string,
    input: UpdateDnsRecordInput,
  ): Promise<DnsRecord>;

  deleteDnsRecord(recordId: string, zoneId: string): Promise<void>;

  listDnsRecords(zoneId: string): Promise<DnsRecord[]>;
}
