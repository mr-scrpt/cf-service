import { DnsRecord } from '../entities/dns-record.entity';

export interface IDnsRecordRepository {
  findById(id: string): Promise<DnsRecord | null>;
  findByZoneId(zoneId: string): Promise<DnsRecord[]>;
  save(record: DnsRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
