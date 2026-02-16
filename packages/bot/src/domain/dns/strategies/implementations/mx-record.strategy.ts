import { DnsRecordType, domainValueSchema, mxRecordSchema, type MXRecordData, type MXRecordFieldKey } from '@cloudflare-bot/domain';
import { COMMON_TTL_VALUES } from '@cloudflare-bot/shared';
import { z } from 'zod';
import {
  DnsRecordStrategy,
  ValidationResult,
  WizardData,
} from '../dns-record-strategy.interface';
import { FieldConfig, FieldInputType } from '../field-config.interface';
import { COMMON_FIELD_CONFIGS } from '../common-fields.config';

interface MXWizardFields {
  name: string;
  content: string;
  priority: number;
  ttl: number;
  comment?: string;
}

export class MXRecordStrategy implements DnsRecordStrategy<MXWizardFields, MXRecordData, MXRecordFieldKey> {
  readonly type = DnsRecordType.MX as const;
  readonly displayName = 'MX Record';
  readonly icon = '📧';
  readonly description = 'Mail server configuration';

  getFieldConfigs(): FieldConfig[] {
    return [
      COMMON_FIELD_CONFIGS.name,
      {
        key: 'content',
        label: 'Mail Server',
        prompt: '📧 Enter mail server domain (e.g., mail.example.com):',
        required: true,
        inputType: FieldInputType.TEXT,
        validationSchema: domainValueSchema,
        placeholder: 'mail.example.com',
      },
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
      COMMON_FIELD_CONFIGS.ttl,
      COMMON_FIELD_CONFIGS.comment,
    ];
  }

  validate(data: Partial<MXWizardFields>): ValidationResult {
    const result = mxRecordSchema.safeParse({
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

  formatSummary(data: MXWizardFields): string {
    return `
📧 <b>${this.displayName}</b>

📝 Name: <code>${data.name}</code>
📧 Mail Server: <code>${data.content}</code>
1️⃣ Priority: ${data.priority}
⏱ TTL: ${this.formatTTL(data.ttl)}
${data.comment ? `💬 ${data.comment}` : ''}
    `.trim();
  }

  toCreateInput(wizardData: WizardData<MXWizardFields>) {
    return {
      zoneId: wizardData.zoneId,
      type: this.type,
      name: wizardData.fields.name,
      content: wizardData.fields.content,
      priority: wizardData.fields.priority,
      ttl: wizardData.fields.ttl,
      proxied: false,
      comment: wizardData.fields.comment,
    };
  }

  getFieldValue(record: MXRecordData, fieldKey: MXRecordFieldKey): unknown {
    return record[fieldKey as keyof MXRecordData];
  }

  applyFieldChanges(record: MXRecordData, changes: Partial<Record<MXRecordFieldKey, unknown>>): Partial<MXRecordData> {
    return changes as Partial<MXRecordData>;
  }

  private formatTTL(ttl: number): string {
    const preset = COMMON_TTL_VALUES.find((v) => v.value === ttl);
    return preset ? preset.label : `${ttl}s`;
  }
}
