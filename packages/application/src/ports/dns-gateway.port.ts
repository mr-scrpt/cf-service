import { DomainDto, DnsRecordDto, CreateDnsRecordDto, UpdateDnsRecordDto } from '../dto';
import { RegisterDomainDto } from '../dto/register-domain.dto';

export interface IDnsGatewayPort {
  registerDomain(input: RegisterDomainDto): Promise<DomainDto>;
  listDomains(): Promise<DomainDto[]>;
  
  createDnsRecord(input: CreateDnsRecordDto): Promise<DnsRecordDto>;
  updateDnsRecord(recordId: string, zoneId: string, input: UpdateDnsRecordDto): Promise<DnsRecordDto>;
  deleteDnsRecord(recordId: string, zoneId: string): Promise<void>;
  listDnsRecords(zoneId: string): Promise<DnsRecordDto[]>;
}
