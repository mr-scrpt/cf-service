import { DnsRecordType, COMMON_TTL_VALUES } from '@cloudflare-bot/shared';
import { z, ZodSchema } from 'zod';
import {
    dnsRecordNameSchema,
    dnsRecordContentSchema,
    ttlSchema,
    mxRecordSchema,
    srvRecordSchema
} from '@cloudflare-bot/shared/dist/domain/dns-record.schema';
import { DnsInputType, DnsFieldName } from './create-dns.constants';

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
    hint?: string; // Optional help text
}

// Access Schema Shapes for Single Source of Truth
const mxShape = mxRecordSchema.shape;
const srvDataShape = srvRecordSchema.shape.data.shape;

// --- Field Definitions ---
export const FIELD_DEFINITIONS: Record<DnsFieldName, DnsFieldDefinition> = {
    // Standard Fields
    [DnsFieldName.NAME]: {
        label: '📝 Name',
        schema: dnsRecordNameSchema,
        input: { type: DnsInputType.TEXT },
        hint: "e.g. 'www', 'sub', or '@' for root"
    },
    [DnsFieldName.CONTENT]: {
        label: '📝 Content',
        schema: dnsRecordContentSchema,
        input: { type: DnsInputType.TEXT },
        hint: "IPv4/IPv6 address or domain name"
    },
    [DnsFieldName.TTL]: {
        label: '⏱ TTL',
        schema: ttlSchema,
        input: {
            type: DnsInputType.SELECT,
            options: COMMON_TTL_VALUES
        },
        hint: "Time to Live (Auto = 1 is recommended)"
    },
    [DnsFieldName.PROXIED]: {
        label: '🛡 Proxy',
        schema: z.boolean(),
        input: { type: DnsInputType.BOOLEAN },
        hint: "Orange cloud (CDN & Protection)"
    },
    // MX Specific
    [DnsFieldName.PRIORITY]: { // MX Priority
        label: '1️⃣ Priority',
        schema: mxShape.priority,
        input: { type: DnsInputType.NUMBER },
        hint: "0-65535 (Lower = higher priority)"
    },
    // SRV Specific
    [DnsFieldName.SRV_PRIORITY]: {
        label: '1️⃣ Priority',
        schema: srvDataShape.priority,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'priority'],
        hint: "Priority of the target host (0-65535)"
    },
    [DnsFieldName.SRV_WEIGHT]: {
        label: '⚖️ Weight',
        schema: srvDataShape.weight,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'weight'],
        hint: "Relative weight (0-65535) for records with same priority"
    },
    [DnsFieldName.SRV_PORT]: {
        label: '🔌 Port',
        schema: srvDataShape.port,
        input: { type: DnsInputType.NUMBER },
        path: ['data', 'port'],
        hint: "TCP/UDP port number (1-65535)"
    },
    [DnsFieldName.SRV_TARGET]: {
        label: '🎯 Target',
        schema: srvDataShape.target,
        input: { type: DnsInputType.TEXT },
        path: ['data', 'target'],
        hint: "Canonical hostname (e.g. sip.example.com)"
    }
};

// --- Record Type Layouts ---
export const RECORD_TYPE_LAYOUTS: Record<DnsRecordType, DnsFieldName[]> = {
    [DnsRecordType.A]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.TTL, DnsFieldName.PROXIED],
    [DnsRecordType.AAAA]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.TTL, DnsFieldName.PROXIED],
    [DnsRecordType.CNAME]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.TTL, DnsFieldName.PROXIED],
    [DnsRecordType.TXT]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.TTL],
    [DnsRecordType.NS]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.TTL],
    [DnsRecordType.MX]: [DnsFieldName.NAME, DnsFieldName.CONTENT, DnsFieldName.PRIORITY, DnsFieldName.TTL],
    [DnsRecordType.SRV]: [
        DnsFieldName.NAME,
        DnsFieldName.SRV_PRIORITY,
        DnsFieldName.SRV_WEIGHT,
        DnsFieldName.SRV_PORT,
        DnsFieldName.SRV_TARGET,
        DnsFieldName.TTL
    ]
};

export function getFieldsForType(type: DnsRecordType): DnsFieldName[] {
    const layout = RECORD_TYPE_LAYOUTS[type];
    if (!layout) {
        throw new Error(`No layout configuration found for record type: ${type}`);
    }
    return layout;
}
