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

// --- Inferred Record Types (from schemas) ---

export type StandardRecord = z.infer<typeof standardRecordSchema>;
export type MXRecord = z.infer<typeof mxRecordSchema>;
export type SRVRecord = z.infer<typeof srvRecordSchema>;

// --- Field Key Types (for type-safe field access) ---

// Base fields common to all records
type BaseRecordFieldKey = keyof z.infer<typeof baseRecordSchema>;

// Standard records (A, AAAA, CNAME, TXT, NS)
export type StandardRecordFieldKey = keyof z.infer<typeof standardRecordSchema>;

// MX Record
export type MXRecordFieldKey = keyof z.infer<typeof mxRecordSchema>;

// SRV Record  
export type SRVRecordFieldKey = keyof z.infer<typeof srvRecordSchema>;

// Union of all possible field keys
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
  .min(60, 'TTL must be at least 60 seconds')
  .max(86400, 'TTL cannot exceed 86400 seconds (1 day)')
  .default(3600);

export const createDnsRecordSchema = z.discriminatedUnion('type', [
  standardRecordSchema.omit({ id: true }),
  mxRecordSchema.omit({ id: true }),
  srvRecordSchema.omit({ id: true }),
]);

// --- Content Validation Schemas ---

export const ipv4Schema = z.ipv4({ message: 'Invalid IPv4 address (e.g. 1.2.3.4)' });
export const ipv6Schema = z.ipv6({ message: 'Invalid IPv6 address (e.g. 2001:db8::1)' });

// Basic domain regex. RFC 1035/1123 is complex, this is a practical approximation for user input.
export const domainValueSchema = z.string()
  .min(1, 'Domain name cannot be empty')
  .regex(/^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})*$/, 'Invalid domain name format (e.g. example.com)');

export const txtContentSchema = z.string().min(1, 'Content cannot be empty').max(2048, 'Content too long');

export const DNS_CONTENT_SCHEMAS: Partial<Record<DnsRecordType, z.ZodType<any>>> = {
  [DnsRecordType.A]: ipv4Schema,
  [DnsRecordType.AAAA]: ipv6Schema,
  [DnsRecordType.CNAME]: domainValueSchema,
  [DnsRecordType.NS]: domainValueSchema,
  [DnsRecordType.MX]: domainValueSchema,  // MX content is the mail server domain
  [DnsRecordType.SRV]: domainValueSchema, // SRV target
  [DnsRecordType.TXT]: txtContentSchema,
};

/**
 * Returns the specific validation schema for the 'content' field based on the record type.
 * Fallback to generic dnsRecordContentSchema.
 */
export const getDnsContentSchema = (type: DnsRecordType): z.ZodType<any> => {
  return DNS_CONTENT_SCHEMAS[type] || dnsRecordContentSchema;
};
