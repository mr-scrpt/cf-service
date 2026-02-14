import { Context } from 'grammy';
import { FieldConfig } from '../strategies/field-config.interface';

export interface WizardStep {
  fieldConfig: FieldConfig;
  customMessage?: string;
}

export interface WizardState {
  currentStepIndex: number;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WizardConfig {
  steps: WizardStep[];
  metadata: Record<string, unknown>;
  onComplete: (ctx: Context, fields: Record<string, unknown>) => Promise<void>;
  onCancel?: (ctx: Context) => Promise<void>;
}
