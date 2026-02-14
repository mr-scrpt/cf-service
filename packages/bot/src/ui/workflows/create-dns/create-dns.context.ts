import {
    DnsRecordType,
    createDnsRecordSchema,
} from '@cloudflare-bot/shared';
import { WizardContext } from '../common/interfaces/wizard-context.interface';
import { ZoneAwareContext } from '../common/interfaces/zone-aware.interface';

export class CreateDnsContext implements WizardContext, ZoneAwareContext {
    public zoneId?: string;
    public zoneName?: string;
    public type?: DnsRecordType;
    public name?: string;
    public content?: string;
    public priority?: number;
    public ttl?: number;
    public proxied?: boolean;
    public data?: Record<string, unknown>;

    // ZoneAwareContext implementation
    setZoneId(zoneId: string) { this.zoneId = zoneId; }
    getZoneId() { return this.zoneId; }

    setZoneName(name: string) { this.zoneName = name; }
    getZoneName() { return this.zoneName; }

    // Flow specific setters
    setType(type: DnsRecordType) { this.type = type; }
    setName(name: string) { this.name = name; }
    setContent(content: string) { this.content = content; }
    setPriority(priority: number) { this.priority = priority; }
    setTtl(ttl: number) { this.ttl = ttl; }
    setProxied(proxied: boolean) { this.proxied = proxied; }
    setData(data: Record<string, unknown>) { this.data = data; }

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
            ...this.data,
        };

        return createDnsRecordSchema.safeParse(payload);
    }
}
