import { z } from 'zod';
import { dnsRecordSchema } from './dns-record.schema';

export type DnsRecord = z.infer<typeof dnsRecordSchema>;
