import { DnsRecordType, type CreateDnsRecordInput, type DnsRecordData } from '@cloudflare-bot/domain';
import { FieldConfig } from './field-config.interface';

export interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface WizardData<TFields = Record<string, unknown>> {
  zoneId: string;
  fields: TFields;
}

export interface DnsRecordStrategy<TData = unknown, TRecord extends DnsRecordData = DnsRecordData, TFieldKey extends string = string> {
  readonly type: DnsRecordType;
  readonly displayName: string;
  readonly icon: string;
  readonly description: string;

  getFieldConfigs(): FieldConfig[];
  validate(data: Partial<TData>): ValidationResult;
  formatSummary(data: TData): string;
  toCreateInput(wizardData: WizardData<TData>): CreateDnsRecordInput;
  
  // Field access and modification helpers - now type-safe with TFieldKey
  getFieldValue(record: TRecord, fieldKey: TFieldKey): unknown;
  applyFieldChanges(record: TRecord, changes: Partial<Record<TFieldKey, unknown>>): Partial<TRecord>;
}
