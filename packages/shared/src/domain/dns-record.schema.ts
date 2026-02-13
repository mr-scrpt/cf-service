import { z } from 'zod';
import { DnsRecordType } from './constants.domain';

const baseRecordSchema = z.object({
  id: z.string(),
  zoneId: z.string().min(1),
  name: z.string().min(1),
  ttl: z.number().int().min(1),
  proxied: z.boolean().default(false),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Standard records (A, AAAA, CNAME, TXT, NS)
export const standardRecordSchema = baseRecordSchema.extend({
  type: z.enum([
    DnsRecordType.A,
    DnsRecordType.AAAA,
    DnsRecordType.CNAME,
    DnsRecordType.TXT,
    DnsRecordType.NS,
  ]),
  content: z.string().min(1),
});

// MX Record - requires priority
export const mxRecordSchema = baseRecordSchema.extend({
  type: z.literal(DnsRecordType.MX),
  content: z.string().min(1),
  priority: z.number().int().min(0).max(65535),
});

// SRV Record - complex data structure
export const srvRecordSchema = baseRecordSchema.extend({
  type: z.literal(DnsRecordType.SRV),
  data: z.object({
    priority: z.number().int().min(0).max(65535),
    weight: z.number().int().min(0).max(65535),
    port: z.number().int().min(0).max(65535),
    target: z.string().min(1),
  }),
});

export const dnsRecordSchema = z.discriminatedUnion('type', [
  standardRecordSchema,
  mxRecordSchema,
  srvRecordSchema,
]);
