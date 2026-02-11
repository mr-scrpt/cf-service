import { z } from 'zod';
import { dnsRecordSchema } from '../domain';

export const createDnsRecordSchema = dnsRecordSchema.omit({ id: true }).extend({
  ttl: z.number().int().min(1).optional().default(1),
  proxied: z.boolean().optional().default(false),
});

export const updateDnsRecordSchema = dnsRecordSchema.omit({ id: true, zoneId: true }).partial();

export type CreateDnsRecordInput = z.infer<typeof createDnsRecordSchema>;
export type UpdateDnsRecordInput = z.infer<typeof updateDnsRecordSchema>;
