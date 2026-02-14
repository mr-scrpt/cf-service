import { WorkflowContext } from '../core/workflow.context';
import { DnsRecord, DnsRecordType } from '@cloudflare-bot/shared';

const KEYS = {
    ZONE_ID: 'zoneId',
    ZONE_NAME: 'zoneName',
    RECORD_TYPE: 'recordType',
    DRAFT_RECORD: 'draftRecord',
    ACTIVE_FIELD: 'activeField',
};

export class CreateDnsWorkflowContext extends WorkflowContext {
    // ZoneAware Interface
    get zoneId(): string | undefined { return this.get(KEYS.ZONE_ID); }
    setZoneId(id: string) { this.set(KEYS.ZONE_ID, id); }

    get zoneName(): string | undefined { return this.get(KEYS.ZONE_NAME); }
    setZoneName(name: string) { this.set(KEYS.ZONE_NAME, name); }
    getZoneId() { return this.zoneId; }
    getZoneName() { return this.zoneName; }

    // Create Specific
    get type(): DnsRecordType | undefined { return this.get(KEYS.RECORD_TYPE); }
    setType(type: DnsRecordType) {
        this.set(KEYS.RECORD_TYPE, type);
        // Initialize basic draft with type
        this.updateDraftRecord({ type });
    }

    // Active Field for Generic Create Step
    setActiveField(field: any) { this.set(KEYS.ACTIVE_FIELD, field); }
    getActiveField(): any { return this.get(KEYS.ACTIVE_FIELD); }

    get draftRecord(): Partial<DnsRecord> {
        return this.get(KEYS.DRAFT_RECORD) || {};
    }

    updateDraftRecord(update: Partial<DnsRecord>) {
        const current = this.draftRecord;
        this.set(KEYS.DRAFT_RECORD, { ...current, ...update });
    }

    getEffectiveRecord(): Partial<DnsRecord> {
        // In creation, effective record IS the draft record
        // But we ensure at least type is set
        return this.draftRecord;
    }
}
