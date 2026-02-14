import { Context, SessionFlavor } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { DnsRecord } from '@cloudflare-bot/shared';
import { ZoneAwareContext } from '../common/interfaces/zone-aware.interface';

export interface EditDnsConversationData {
    zoneId?: string;
    recordId?: string;
    originalRecord?: DnsRecord;
    modifiedRecord?: Partial<DnsRecord>;
}

export class EditDnsState implements ZoneAwareContext {
    public zoneId?: string;
    public recordId?: string;
    public originalRecord?: DnsRecord;
    public modifiedRecord: Partial<DnsRecord> = {};

    // ZoneAwareContext implementation
    setZoneId(zoneId: string) { this.zoneId = zoneId; }
    getZoneId() { return this.zoneId; }

    setRecord(record: DnsRecord) {
        this.originalRecord = record;
        this.recordId = record.id;
        // Initialize modifiedRecord with original values? NO, keep it diff-only for now,
        // or copy for easier editing?
        // Let's keep it null-safe, but potentially copy values when editing starts
        // actually for UX, we usually want to show "Current -> New".
        // So modifiedRecord can just hold what CHANGED.
    }

    getEffectiveRecord(): DnsRecord {
        if (!this.originalRecord) throw new Error('Original record not set');
        // Merge original with modified
        // Note: DnsRecord is a union type, so we need careful merging strictly speaking,
        // but for now a spread works if types align.
        return {
            ...this.originalRecord,
            ...this.modifiedRecord
        } as DnsRecord;
    }
}

export type EditDnsContext = Context & ConversationFlavor<Context> & SessionFlavor<EditDnsConversationData>;
