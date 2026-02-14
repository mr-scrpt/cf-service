import { DnsFieldDefinition } from '../config/edit-dns.config';

/**
 * Formats a DNS record name to be relative to the zone name.
 * e.g. "www.example.com" (zone: "example.com") -> "www"
 * "example.com" (zone: "example.com") -> "example.com" (root)
 */
export function formatRelativeName(recordName: string, zoneName?: string): string {
    if (!zoneName) return recordName;

    const suffix = '.' + zoneName;
    if (recordName.endsWith(suffix)) {
        return recordName.substring(0, recordName.length - suffix.length);
    }
    return recordName;
}

/**
 * Resolves a value from a record based on the field definition.
 * Handles nested paths (e.g. data.priority).
 */
export function resolveRecordValue(record: any, fieldDef: DnsFieldDefinition, key: string): any {
    if (!record) return undefined;

    if (fieldDef.path) {
        let val = record;
        for (const p of fieldDef.path) {
            val = val ? val[p] : undefined;
        }
        return val;
    }

    // If no path, assume config key maps to record key
    return record[key];
}
