import { DnsRecordType, COMMON_TTL_VALUES } from '@cloudflare-bot/shared';
import { z, ZodSchema } from 'zod';
import {
    dnsRecordNameSchema,
    dnsRecordContentSchema,
    ttlSchema,
    mxRecordSchema,
    srvRecordSchema
} from '@cloudflare-bot/shared/dist/domain/dns-record.schema';
import { DnsInputType } from './edit-dns.constants';

// --- Input Strategies ---
export type FieldInputStrategy =
    | { type: DnsInputType.TEXT }
    | { type: DnsInputType.NUMBER }
    | { type: DnsInputType.SELECT, options: readonly { label: string, value: any }[] }
    | { type: DnsInputType.BOOLEAN };

export interface DnsFieldDefinition {
    label: string;
    schema: ZodSchema<any>;
    input: FieldInputStrategy;
    path?: string[]; // For nested fields like data.priority
}

// Access Schema Shapes for Single Source of Truth
const mxShape = mxRecordSchema.shape;
const srvDataShape = srvRecordSchema.shape.data.shape;

// --- Field Definitions ---
export const FIELD_DEFINITIONS: Record<string, DnsFieldDefinition> = {
    // Standard Fields
    name: {
        label: '📝 Name',
        schema: dnsRecordNameSchema,
        input: { type: DnsInputType.TEXT }
    },
    content: {
        label: '📝 Content',
        schema: dnsRecordContentSchema,
        input: { type: DnsInputType.TEXT }
    },
    ttl: {
        label: '⏱ TTL',
        schema: ttlSchema,
        input: {
            type: DnsInputType.SELECT,
            options: COMMON_TTL_VALUES
        }
    },
    proxied: {
        label: '🛡 Proxy',
        schema: z.boolean(),
        input: { type: DnsInputType.BOOLEAN }
    },
    // MX Specific
    priority: { // MX Priority
        label: '1️⃣ Priority',
        schema: mxShape.priority,
        input: { type: DnsInputType.NUMBER }
    },
    // SRV Specific
    srv_priority: {
        label: '1️⃣ Priority',
        schema: srvDataShape.priority,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'priority']
    },
    srv_weight: {
        label: '⚖️ Weight',
        schema: srvDataShape.weight,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'weight']
    },
    srv_port: {
        label: '🔌 Port',
        schema: srvDataShape.port,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'port']
    },
    srv_target: {
        label: '🎯 Target',
        schema: srvDataShape.target,
        input: { type: DnsInputType.TEXT },
        path: ['data', 'target']
    }
};

// --- Layouts ---
// Keys are strictly typed to DnsRecordType
export const RECORD_TYPE_LAYOUTS: Record<DnsRecordType | 'DEFAULT', (keyof typeof FIELD_DEFINITIONS)[]> = {
    [DnsRecordType.A]: ['name', 'content', 'ttl', 'proxied'],
    [DnsRecordType.AAAA]: ['name', 'content', 'ttl', 'proxied'],
    [DnsRecordType.CNAME]: ['name', 'content', 'ttl', 'proxied'],
    [DnsRecordType.TXT]: ['name', 'content', 'ttl'],
    [DnsRecordType.NS]: ['name', 'content', 'ttl'],
    [DnsRecordType.MX]: ['name', 'content', 'priority', 'ttl'],
    [DnsRecordType.SRV]: ['name', 'srv_priority', 'srv_weight', 'srv_port', 'srv_target', 'ttl', 'proxied'],
    DEFAULT: ['name', 'content', 'ttl']
};

export function getFieldsForType(type: DnsRecordType): string[] {
    return RECORD_TYPE_LAYOUTS[type] || RECORD_TYPE_LAYOUTS.DEFAULT;
}


