import { z } from 'zod';
import { DnsRecordType } from '../domain';

export const createDnsRecordSchema = z.object({
  zoneId: z.string().min(1),
  type: z.enum(DnsRecordType),
  name: z.string().min(1),
  content: z.string().min(1),
  ttl: z.number().int().min(1).optional().default(1), // 1 = auto в Cloudflare
  proxied: z.boolean().optional().default(false),
});

export const updateDnsRecordSchema = z.object({
  type: z.enum(DnsRecordType).optional(),
  name: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  ttl: z.number().int().min(1).optional(),
  proxied: z.boolean().optional(),
});

export type CreateDnsRecordInput = z.infer<typeof createDnsRecordSchema>;
export type UpdateDnsRecordInput = z.infer<typeof updateDnsRecordSchema>;
