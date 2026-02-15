import {
  DnsRecordType,
  DnsRecord,
  domainValueSchema,
  standardRecordSchema,
  COMMON_TTL_VALUES,
} from '@cloudflare-bot/shared';
import {
  DnsRecordStrategy,
  ValidationResult,
  WizardData,
} from '../dns-record-strategy.interface';
import { FieldConfig, FieldInputType } from '../field-config.interface';
import { COMMON_FIELD_CONFIGS } from '../common-fields.config';

interface CNAMERecordData {
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  comment?: string;
}

export class CNAMERecordStrategy implements DnsRecordStrategy<CNAMERecordData> {
  readonly type = DnsRecordType.CNAME;
  readonly displayName = 'CNAME Record';
  readonly icon = '🔗';
  readonly description = 'Alias to another domain';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'Target Domain',
        prompt: '🎯 Enter target domain (e.g., example.com):',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: domainValueSchema,
        placeholder: 'example.com',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.proxied,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<CNAMERecordData>): ValidationResult {
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

  formatSummary(data: CNAMERecordData): string {
    return `
🔗 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
🎯 Target: <code>${data.content}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.proxied ? '🟠 Proxied' : '⚪️ DNS only'}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData) {
    return {
      zoneId: wizardData.zoneId,
      type: this.type,
      name: wizardData.fields.name as string,
      content: wizardData.fields.content as string,
      ttl: (wizardData.fields.ttl as number) ?? 3600,
      proxied: (wizardData.fields.proxied as boolean) ?? false,
      comment: wizardData.fields.comment as string | undefined,
    };
  }

  getFieldValue(record: DnsRecord, fieldKey: string): unknown {
    return (record as any)[fieldKey];
  }

  applyFieldChanges(record: DnsRecord, changes: Record<string, unknown>): Partial<DnsRecord> {
    return changes;
  }

  private formatTTL(ttl: number): string {
    const preset = COMMON_TTL_VALUES.find((v) => v.value === ttl);
    return preset ? preset.label : `${ttl}s`;
  }
}
