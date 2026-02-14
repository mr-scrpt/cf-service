import { Context, SessionFlavor } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { DnsRecord } from '@cloudflare-bot/shared';
import { ZoneAwareContext } from '../common/interfaces/zone-aware.interface';

export interface DeleteDnsConversationData {
    zoneId?: string;
    recordId?: string;
    recordDetails?: DnsRecord;
}

export class DeleteDnsState implements ZoneAwareContext {
    public zoneId?: string;
    public zoneName?: string;
    public recordId?: string;
    public recordDetails?: DnsRecord;

    // ZoneAwareContext implementation
    setZoneId(zoneId: string) { this.zoneId = zoneId; }
    getZoneId() { return this.zoneId; }

    setZoneName(name: string) { this.zoneName = name; }
    getZoneName() { return this.zoneName; }

    setRecordId(recordId: string) { this.recordId = recordId; }
    setRecordDetails(record: DnsRecord) { this.recordDetails = record; }
}

export type DeleteDnsContext = Context & ConversationFlavor<Context> & SessionFlavor<DeleteDnsConversationData>;
