import { TTL_VALUES } from '@cloudflare-bot/shared';

export interface TtlPreset {
  value: number;
  label: string;
}

export const TTL_PRESETS: TtlPreset[] = [
  { value: 60, label: '1 мин' },
  { value: 300, label: '5 мин' },
  { value: 3600, label: '1 час ⭐' },
  { value: 86400, label: '1 день' },
  { value: TTL_VALUES.AUTO, label: 'Auto' },
];
