import {
  DnsRecordType,
  txtContentSchema,
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

interface TXTRecordData {
  name: string;
  content: string;
  ttl: number;
  comment?: string;
}

export class TXTRecordStrategy implements DnsRecordStrategy<TXTRecordData, StandardRecord, StandardRecordFieldKey> {
  readonly type = DnsRecordType.TXT;
  readonly displayName = 'TXT Record';
  readonly icon = '📝';
  readonly description = 'Text record for verification and metadata';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'Text Content',
        prompt: '📝 Enter text content:',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: txtContentSchema,
        placeholder: 'v=spf1 include:_spf.example.com ~all',
        helpText: 'Text records are used for SPF, DKIM, domain verification, etc.',
      },
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<TXTRecordData>): ValidationResult {
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

  formatSummary(data: TXTRecordData): string {
    const truncatedContent =
      data.content.length > 100
        ? `${data.content.substring(0, 100)}...`
        : data.content;

    return `
📝 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
📄 Content: <code>${truncatedContent}</code>
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<TXTRecordData>) {
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
