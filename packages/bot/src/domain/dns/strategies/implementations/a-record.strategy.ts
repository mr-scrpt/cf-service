import { DnsRecordType } from '@cloudflare-bot/domain';
import {
  ipv4Schema,
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

interface ARecordData {
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  comment?: string;
}

export class ARecordStrategy implements DnsRecordStrategy<ARecordData, StandardRecord, StandardRecordFieldKey> {
  readonly type = DnsRecordType.A as const;
  readonly displayName = 'A Record';
  readonly icon = '🌐';
  readonly description = 'Maps domain to IPv4 address';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'IPv4 Address',
        prompt: '📍 Enter IPv4 address (e.g., 192.0.2.1):',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: ipv4Schema,
        placeholder: '192.0.2.1',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.proxied,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<ARecordData>): ValidationResult {
    const result = standardRecordSchema.safeParse({
      ...data,
      type: this.type,
      id: 'temp-id',
      zoneId: 'temp-zone',
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

  formatSummary(data: ARecordData): string {
    return `
🌐 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
📍 IPv4: <code>${data.content}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.proxied ? '🟠 Proxied' : '⚪️ DNS only'}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<ARecordData>) {
    return {
      zoneId: wizardData.zoneId,
      type: this.type,
      name: wizardData.fields.name,
      content: wizardData.fields.content,
      ttl: wizardData.fields.ttl,
      proxied: wizardData.fields.proxied,
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
