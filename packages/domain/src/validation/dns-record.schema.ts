import { z } from 'zod';
import { DnsRecordType } from '../entities/dns-record.entity';
import { TTL_CONSTRAINTS } from '../constants/ttl-constraints';

const baseRecordSchema = z.object({
  id: z.string(),
  zoneId: z.string().min(1),
  name: z.string().min(1),
  ttl: z.number().int().min(1),
  proxied: z.boolean().default(false),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const standardRecordSchema = baseRecordSchema.extend({
  type: z.nativeEnum(DnsRecordType).refine(
    (val) => [DnsRecordType.A, DnsRecordType.AAAA, DnsRecordType.CNAME, DnsRecordType.TXT, DnsRecordType.NS].includes(val)
  ),
  content: z.string().min(1),
});

export const mxRecordSchema = baseRecordSchema.extend({
  type: z.literal(DnsRecordType.MX),
  content: z.string().min(1),
  priority: z.number().int().min(0).max(65535),
});

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

export type StandardRecordData = z.infer<typeof standardRecordSchema>;
export type MXRecordData = z.infer<typeof mxRecordSchema>;
export type SRVRecordData = z.infer<typeof srvRecordSchema>;
export type DnsRecordData = z.infer<typeof dnsRecordSchema>;

export type StandardRecordFieldKey = keyof StandardRecordData;
export type MXRecordFieldKey = keyof MXRecordData;
export type SRVRecordFieldKey = keyof SRVRecordData;
export type DnsRecordFieldKey = StandardRecordFieldKey | MXRecordFieldKey | SRVRecordFieldKey;

export const dnsRecordNameSchema = z
  .string()
  .min(1, 'Record name cannot be empty')
  .max(255, 'Record name too long');

export const dnsRecordContentSchema = z
  .string()
  .min(1, 'Content cannot be empty')
  .max(512, 'Content too long');

export const ttlSchema = z
  .number()
  .int('TTL must be an integer')
  .min(TTL_CONSTRAINTS.MIN, `TTL must be at least ${TTL_CONSTRAINTS.MIN} seconds`)
  .max(TTL_CONSTRAINTS.MAX, `TTL cannot exceed ${TTL_CONSTRAINTS.MAX} seconds (1 day)`)
  .default(3600);

export const ipv4Schema = z.ipv4({ message: 'Invalid IPv4 address (e.g. 1.2.3.4)' });
export const ipv6Schema = z.ipv6({ message: 'Invalid IPv6 address (e.g. 2001:db8::1)' });

export const domainValueSchema = z.string()
  .min(1, 'Domain name cannot be empty')
  .regex(/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*$/, 'Invalid domain name format (e.g. example.com)');

export const txtContentSchema = z.string().min(1, 'Content cannot be empty').max(2048, 'Content too long');

export const DNS_CONTENT_SCHEMAS: Partial<Record<DnsRecordType, z.ZodType<any>>> = {
  [DnsRecordType.A]: ipv4Schema,
  [DnsRecordType.AAAA]: ipv6Schema,
  [DnsRecordType.CNAME]: domainValueSchema,
  [DnsRecordType.NS]: domainValueSchema,
  [DnsRecordType.MX]: domainValueSchema,
  [DnsRecordType.SRV]: domainValueSchema,
  [DnsRecordType.TXT]: txtContentSchema,
};

export const getDnsContentSchema = (type: DnsRecordType): z.ZodType<any> => {
  return DNS_CONTENT_SCHEMAS[type] || dnsRecordContentSchema;
};
