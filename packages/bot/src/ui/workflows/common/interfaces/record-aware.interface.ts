import { DnsRecord } from '@cloudflare-bot/shared';
import { ZoneAwareContext } from './zone-aware.interface';

export interface RecordAwareContext extends ZoneAwareContext {
    setRecordId(id: string): void;
    getRecordId(): string | undefined;
}
