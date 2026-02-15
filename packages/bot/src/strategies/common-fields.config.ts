import {
  dnsRecordNameSchema,
  ttlSchema,
  COMMON_TTL_VALUES,
} from '@cloudflare-bot/shared';
import { z } from 'zod';
import { FieldConfig, FieldInputType } from './field-config.interface';

export const COMMON_FIELD_CONFIGS: Record<string, FieldConfig> = {
  name: {
    key: 'name',
    label: 'Name',
    prompt: '📝 Enter the record name (e.g., www or @ for root):',
    required: true,
    inputType: FieldInputType.TEXT,
    validationSchema: dnsRecordNameSchema,
    placeholder: 'www',
    helpText: 'Use @ for the root domain',
  },

  ttl: {
    key: 'ttl',
    label: 'TTL',
    prompt: '⏱ Select Time To Live (TTL):',
    required: true,
    inputType: FieldInputType.SELECT,
    validationSchema: ttlSchema,
    defaultValue: 3600,
    options: COMMON_TTL_VALUES.map(({ label, value }) => ({
      label,
      value,
    })),
    helpText: 'Time before DNS cache expires',
  },

  proxied: {
    key: 'proxied',
    label: 'Proxy Status',
    prompt: '🟠 Enable Cloudflare proxy?',
    required: true,
    inputType: FieldInputType.BOOLEAN,
    validationSchema: z.boolean(),
    defaultValue: false,
    options: [
      { label: '🟠 Proxied (Recommended)', value: true },
      { label: '⚪️ DNS only', value: false },
    ],
  },

  comment: {
    key: 'comment',
    label: 'Comment',
    prompt: '💬 Add an optional comment:',
    required: false,
    inputType: FieldInputType.TEXT,
    validationSchema: z.string().optional(),
    placeholder: 'Optional description',
  },
};
