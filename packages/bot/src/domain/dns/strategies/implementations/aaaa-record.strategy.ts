import { DnsRecordType, ipv6Schema, standardRecordSchema, type StandardRecordData, type StandardRecordFieldKey } from '@cloudflare-bot/domain';
import { COMMON_TTL_VALUES } from '@cloudflare-bot/shared';
import {
  DnsRecordStrategy,
  ValidationResult,
  WizardData,
} from '../dns-record-strategy.interface';
import { FieldConfig, FieldInputType } from '../field-config.interface';
import { COMMON_FIELD_CONFIGS } from '../common-fields.config';

interface AAAARecordWizardFields {
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  comment?: string;
}

export class AAAARecordStrategy implements DnsRecordStrategy<AAAARecordWizardFields, StandardRecordData, StandardRecordFieldKey> {
  readonly type = DnsRecordType.AAAA as const;
  readonly displayName = 'AAAA Record';
  readonly icon = '🌐';
  readonly description = 'Maps domain to IPv6 address';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'IPv6 Address',
        prompt: '📍 Enter IPv6 address (e.g., 2001:db8::1):',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: ipv6Schema,
        placeholder: '2001:db8::1',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.proxied,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<AAAARecordWizardFields>): ValidationResult {
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

  formatSummary(data: AAAARecordWizardFields): string {
    return `
🌐 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
📍 IPv6: <code>${data.content}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.proxied ? '🟠 Proxied' : '⚪️ DNS only'}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<AAAARecordWizardFields>) {
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

  getFieldValue(record: StandardRecordData, fieldKey: StandardRecordFieldKey): unknown {
    return record[fieldKey];
  }

  applyFieldChanges(record: StandardRecordData, changes: Partial<Record<StandardRecordFieldKey, unknown>>): Partial<StandardRecordData> {
    return changes as Partial<StandardRecordData>;
  }

  private formatTTL(ttl: number): string {
    const preset = COMMON_TTL_VALUES.find((v) => v.value === ttl);
    return preset ? preset.label : `${ttl}s`;
  }
}
