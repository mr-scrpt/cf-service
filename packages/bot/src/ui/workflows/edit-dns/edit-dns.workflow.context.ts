import { WorkflowContext } from '../core/workflow.context';
import { DnsRecord } from '@cloudflare-bot/shared';

const KEYS = {
    ZONE_ID: 'zoneId',
    ZONE_NAME: 'zoneName',
    RECORD_ID: 'recordId',
    ORIGINAL_RECORD: 'originalRecord',
    MODIFIED_RECORD: 'modifiedRecord',
    ACTIVE_FIELD: 'activeField',
};

export class EditDnsWorkflowContext extends WorkflowContext {
    // ZoneAware Interface
    get zoneId(): string | undefined { return this.get(KEYS.ZONE_ID); }
    setZoneId(id: string) { this.set(KEYS.ZONE_ID, id); }

    get zoneName(): string | undefined { return this.get(KEYS.ZONE_NAME); }
    setZoneName(name: string) { this.set(KEYS.ZONE_NAME, name); }
    getZoneId() { return this.zoneId; }
    getZoneName() { return this.zoneName; }

    // Edit Specific
    get recordId(): string | undefined { return this.get(KEYS.RECORD_ID); }

    // Active Field for Generic Edit Step
    setActiveField(field: any) { this.set(KEYS.ACTIVE_FIELD, field); }
    getActiveField(): any { return this.get(KEYS.ACTIVE_FIELD); }

    setRecord(record: DnsRecord) {
        this.set(KEYS.ORIGINAL_RECORD, record);
        this.set(KEYS.RECORD_ID, record.id);
        this.set(KEYS.MODIFIED_RECORD, {});
    }

    get originalRecord(): DnsRecord | undefined { return this.get(KEYS.ORIGINAL_RECORD); }

    get modifiedRecord(): Partial<DnsRecord> {
        return this.get(KEYS.MODIFIED_RECORD) || {};
    }

    updateModifiedRecord(update: Partial<DnsRecord>) {
        const current = this.modifiedRecord;
        this.set(KEYS.MODIFIED_RECORD, { ...current, ...update });
    }

    getEffectiveRecord(): DnsRecord {
        const original = this.originalRecord;
        if (!original) throw new Error('Original record not set');
        return {
            ...original,
            ...this.modifiedRecord
        } as DnsRecord;
    }
}
