import { DnsRecordType } from '@cloudflare-bot/shared';

export interface DnsFieldDefinition {
    key: string;
    label: string;
    path?: string[];
    type: 'string' | 'number' | 'boolean';
    stepId?: string;
}

// Reusable Field Definitions
const F_NAME: DnsFieldDefinition = { key: 'name', label: '📝 Name', type: 'string', stepId: 'edit_name' };
const F_CONTENT: DnsFieldDefinition = { key: 'content', label: '📝 Content', type: 'string' }; // Generic
const F_TTL: DnsFieldDefinition = { key: 'ttl', label: '⏱ TTL', type: 'number', stepId: 'edit_ttl' };
const F_PROXIED: DnsFieldDefinition = { key: 'proxied', label: '🛡 Proxy', type: 'boolean', stepId: 'edit_proxied' };
const F_PRIORITY: DnsFieldDefinition = { key: 'priority', label: '1️⃣ Priority', type: 'number' }; // For MX

// SRV Specific
const SRV_FIELDS: DnsFieldDefinition[] = [
    F_NAME,
    { key: 'priority', label: '1️⃣ Priority', path: ['data', 'priority'], type: 'number' },
    { key: 'weight', label: '⚖️ Weight', path: ['data', 'weight'], type: 'number' },
    { key: 'port', label: '🔌 Port', path: ['data', 'port'], type: 'number' },
    { key: 'target', label: '🎯 Target', path: ['data', 'target'], type: 'string' },
    F_TTL,
    F_PROXIED // SRV *can* sometimes be proxied in Cloudflare (Spectrum), but often not. Leaving it enabled as per user previous context, but strictly speaking typically not for standard web.
    // User didn't complain about SRV proxy, but did about TXT.
];

// Common Combinations
const PROXIABLE_FIELDS = [F_NAME, F_CONTENT, F_TTL, F_PROXIED];
const STANDARD_FIELDS = [F_NAME, F_CONTENT, F_TTL];

export const DNS_RECORD_FIELDS: Record<string, DnsFieldDefinition[]> = {
    // Proxiable Types
    A: PROXIABLE_FIELDS,
    AAAA: PROXIABLE_FIELDS,
    CNAME: PROXIABLE_FIELDS,

    // Non-Proxiable Types
    TXT: STANDARD_FIELDS,
    NS: STANDARD_FIELDS,
    MX: [F_NAME, F_CONTENT, F_PRIORITY, F_TTL], // MX usually has priority and content (mail server)

    // Complex Types
    SRV: SRV_FIELDS,

    // Fallback
    DEFAULT: STANDARD_FIELDS // Default to NO proxy to be safe
};

export function getFieldsForType(type: DnsRecordType): DnsFieldDefinition[] {
    const specific = DNS_RECORD_FIELDS[type];
    if (specific && specific.length > 0) return specific;
    return DNS_RECORD_FIELDS.DEFAULT;
}
