import { CreateDnsRecordInput, DnsRecord, DnsRecordType } from '@cloudflare-bot/shared';
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

export interface DnsRecordStrategy<TData = unknown, TRecord extends DnsRecord = DnsRecord> {
  readonly type: DnsRecordType;
  readonly displayName: string;
  readonly icon: string;
  readonly description: string;

  getFieldConfigs(): FieldConfig[];
  validate(data: Partial<TData>): ValidationResult;
  formatSummary(data: TData): string;
  toCreateInput(wizardData: WizardData): CreateDnsRecordInput;
  
  // Field access and modification helpers - now type-safe per strategy
  getFieldValue(record: TRecord, fieldKey: string): unknown;
  applyFieldChanges(record: TRecord, changes: Record<string, unknown>): Partial<TRecord>;
}
