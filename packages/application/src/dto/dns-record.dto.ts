import { DnsRecordType } from '@cloudflare-bot/domain';

export interface StandardDnsRecordDto {
  id: string;
  zoneId: string;
  type: DnsRecordType;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  comment?: string;
  tags?: string[];
}

export interface MXDnsRecordDto {
  id: string;
  zoneId: string;
  type: DnsRecordType.MX;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  priority: number;
  comment?: string;
  tags?: string[];
}

export interface SRVDnsRecordDto {
  id: string;
  zoneId: string;
  type: DnsRecordType.SRV;
  name: string;
  ttl: number;
  proxied: boolean;
  data: {
    priority: number;
    weight: number;
    port: number;
    target: string;
  };
  comment?: string;
  tags?: string[];
}

export type DnsRecordDto = StandardDnsRecordDto | MXDnsRecordDto | SRVDnsRecordDto;

export interface CreateDnsRecordDto {
  zoneId: string;
  type: DnsRecordType;
  name: string;
  content?: string;
  ttl: number;
  proxied?: boolean;
  comment?: string;
  tags?: string[];
  priority?: number;
  data?: {
    priority: number;
    weight: number;
    port: number;
    target: string;
  };
}

export interface UpdateDnsRecordDto {
  zoneId: string;
  type?: DnsRecordType;
  name?: string;
  content?: string;
  ttl?: number;
  proxied?: boolean;
  comment?: string;
  tags?: string[];
  priority?: number;
  data?: {
    priority: number;
    weight: number;
    port: number;
    target: string;
  };
}
