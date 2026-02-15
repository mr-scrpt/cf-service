import {
  DnsRecordType,
  DnsRecord,
  ipv6Schema,
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

interface AAAARecordData {
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
  comment?: string;
}

export class AAAARecordStrategy implements DnsRecordStrategy<AAAARecordData> {
  readonly type = DnsRecordType.AAAA;
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

  validate(data: Partial<AAAARecordData>): ValidationResult {
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

  formatSummary(data: AAAARecordData): string {
    return `
🌐 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
📍 IPv6: <code>${data.content}</code>
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
