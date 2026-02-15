import {
  DnsRecordType,
  domainValueSchema,
  srvRecordSchema,
  COMMON_TTL_VALUES,
  type SRVRecord,
  type SRVRecordFieldKey,
} from '@cloudflare-bot/shared';
import { z } from 'zod';
import {
  DnsRecordStrategy,
  ValidationResult,
  WizardData,
} from '../dns-record-strategy.interface';
import { FieldConfig, FieldInputType } from '../field-config.interface';
import { COMMON_FIELD_CONFIGS } from '../common-fields.config';

interface SRVRecordData {
  name: string;
  data: {
    priority: number;
    weight: number;
    port: number;
    target: string;
  };
  ttl: number;
  comment?: string;
}

export class SRVRecordStrategy implements DnsRecordStrategy<SRVRecordData, SRVRecord, SRVRecordFieldKey> {
  readonly type = DnsRecordType.SRV;
  readonly displayName = 'SRV Record';
  readonly icon = '🔌';
  readonly description = 'Service locator record';
  
  private readonly dataFields = new Set(['priority', 'weight', 'port', 'target']);

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'priority',
        label: 'Priority',
        prompt: '1️⃣ Enter priority (0-65535, lower = higher priority):',
        required: true,
        inputType: FieldInputType.NUMBER,
        validationSchema: z.number().int().min(0).max(65535),
        defaultValue: 10,
        helpText: 'Lower values have higher priority',
      },
      {
        key: 'weight',
        label: 'Weight',
        prompt: '⚖️ Enter weight (0-65535):',
        required: true,
        inputType: FieldInputType.NUMBER,
        validationSchema: z.number().int().min(0).max(65535),
        defaultValue: 10,
        helpText: 'Relative weight for records with same priority',
      },
      {
        key: 'port',
        label: 'Port',
        prompt: '🔌 Enter port number (0-65535):',
        required: true,
        inputType: FieldInputType.NUMBER,
        validationSchema: z.number().int().min(0).max(65535),
        placeholder: '443',
      },
      {
        key: 'target',
        label: 'Target',
        prompt: '🎯 Enter target hostname:',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: domainValueSchema,
        placeholder: 'server.example.com',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<SRVRecordData>): ValidationResult {
    const result = srvRecordSchema.safeParse({
      ...data,
      type: this.type,
      id: 'temp-id',
      zoneId: 'temp-zone',
      proxied: false,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || result.error.message,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  formatSummary(data: SRVRecordData): string {
    return `
🔌 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
1️⃣ Priority: ${data.data.priority}
⚖️ Weight: ${data.data.weight}
🔌 Port: ${data.data.port}
🎯 Target: <code>${data.data.target}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<SRVRecordData>) {
    return {
      zoneId: wizardData.zoneId,
      type: this.type,
      name: wizardData.fields.name,
      data: wizardData.fields.data,
      ttl: wizardData.fields.ttl,
      proxied: false,
      comment: wizardData.fields.comment,
    };
  }

  getFieldValue(record: SRVRecord, fieldKey: SRVRecordFieldKey): unknown {
    return this.dataFields.has(fieldKey) 
      ? record.data[fieldKey as keyof typeof record.data]
      : record[fieldKey as keyof SRVRecord];
  }

  applyFieldChanges(record: SRVRecord, changes: Partial<Record<SRVRecordFieldKey, unknown>>): Partial<SRVRecord> {
    const entries = Object.entries(changes);
    return {
      ...Object.fromEntries(entries.filter(([k]) => !this.dataFields.has(k))),
      data: { ...record.data, ...Object.fromEntries(entries.filter(([k]) => this.dataFields.has(k))) },
    };
  }

  private formatTTL(ttl: number): string {
    const preset = COMMON_TTL_VALUES.find((v) => v.value === ttl);
    return preset ? preset.label : `${ttl}s`;
  }
}
