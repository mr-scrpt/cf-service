import { z } from 'zod';
import { DnsRecordType } from './constants.domain';

export const dnsRecordSchema = z.object({
  id: z.string(),
  zoneId: z.string().min(1),
  type: z.enum(DnsRecordType),
  name: z.string().min(1),
  content: z.string().min(1),
  ttl: z.number().int().min(1),
  proxied: z.boolean(),
});

export type DnsRecord = z.infer<typeof dnsRecordSchema>;
