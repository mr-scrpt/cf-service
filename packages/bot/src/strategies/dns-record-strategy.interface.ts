import { DnsRecordType, CreateDnsRecordInput } from '@cloudflare-bot/shared';
import { FieldConfig } from './field-config.interface';

export interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface WizardData {
  zoneId: string;
  fields: Record<string, unknown>;
}

export interface DnsRecordStrategy<TData = unknown> {
  readonly type: DnsRecordType;
  readonly displayName: string;
  readonly icon: string;
  readonly description: string;

  getFieldConfigs(): FieldConfig[];
  validate(data: Partial<TData>): ValidationResult;
  formatSummary(data: TData): string;
  toCreateInput(wizardData: WizardData): CreateDnsRecordInput;
}
