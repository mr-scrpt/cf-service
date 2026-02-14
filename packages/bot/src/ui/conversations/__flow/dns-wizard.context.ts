import {
    DnsRecordType,
    CreateDnsRecordInput,
    createDnsRecordSchema,
} from '@cloudflare-bot/shared';

export class DnsWizardContext {
    public zoneId?: string;
    public type?: DnsRecordType;
    public name?: string;
    public content?: string;
    public priority?: number;
    public ttl?: number;
    public proxied?: boolean;
    public data?: Record<string, unknown>;

    // Type-safe setters
    setZoneId(zoneId: string) { this.zoneId = zoneId; }
    setType(type: DnsRecordType) { this.type = type; }
    setName(name: string) { this.name = name; }
    setContent(content: string) { this.content = content; }
    setPriority(priority: number) { this.priority = priority; }
    setTtl(ttl: number) { this.ttl = ttl; }
    setProxied(proxied: boolean) { this.proxied = proxied; }
    setData(data: Record<string, unknown>) { this.data = data; }

    /**
     * Validates the current state and returns a SafeParseResult.
     * This is the single source of truth for validation.
     */
    validate() {
        const payload = {
            zoneId: this.zoneId,
            type: this.type,
            name: this.name,
            content: this.content,
            priority: this.priority,
            ttl: this.ttl,
            proxied: this.proxied,
            data: this.data,
            ...this.data, // Merge data for flat structure if needed by some validators, but schema expects nested
        };

        return createDnsRecordSchema.safeParse(payload);
    }
}
