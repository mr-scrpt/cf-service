import { DnsRecordType } from '@cloudflare-bot/domain';
import {
  domainValueSchema,
  standardRecordSchema,
  COMMON_TTL_VALUES,
  type StandardRecord,
  type StandardRecordFieldKey,
} from '@cloudflare-bot/shared';
import {
  DnsRecordStrategy,
  ValidationResult,
  WizardData,
} from '../dns-record-strategy.interface';
import { FieldConfig, FieldInputType } from '../field-config.interface';
import { COMMON_FIELD_CONFIGS } from '../common-fields.config';

interface NSRecordData {
  name: string;
  content: string;
  ttl: number;
  comment?: string;
}

export class NSRecordStrategy implements DnsRecordStrategy<NSRecordData, StandardRecord, StandardRecordFieldKey> {
  readonly type = DnsRecordType.NS as const;
  readonly displayName = 'NS Record';
  readonly icon = '🌐';
  readonly description = 'Nameserver delegation';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'Nameserver',
        prompt: '🌐 Enter nameserver domain (e.g., ns1.example.com):',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: domainValueSchema,
        placeholder: 'ns1.example.com',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<NSRecordData>): ValidationResult {
    const result = standardRecordSchema.safeParse({
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

  formatSummary(data: NSRecordData): string {
    return `
🌐 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
🌐 Nameserver: <code>${data.content}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<NSRecordData>) {
    return {
      zoneId: wizardData.zoneId,
      type: this.type,
      name: wizardData.fields.name,
      content: wizardData.fields.content,
      ttl: wizardData.fields.ttl,
      proxied: false,
      comment: wizardData.fields.comment,
    };
  }

  getFieldValue(record: StandardRecord, fieldKey: StandardRecordFieldKey): unknown {
    return record[fieldKey as keyof StandardRecord];
  }

  applyFieldChanges(record: StandardRecord, changes: Partial<Record<StandardRecordFieldKey, unknown>>): Partial<StandardRecord> {
    return changes as Partial<StandardRecord>;
  }

  private formatTTL(ttl: number): string {
    const preset = COMMON_TTL_VALUES.find((v) => v.value === ttl);
    return preset ? preset.label : `${ttl}s`;
  }
}
