import { Context } from 'grammy';
import { FieldConfig } from '@domain/dns/strategies/field-config.interface';

export interface WizardStep {
  fieldConfig: FieldConfig;
  customMessage?: string;
}

export interface WizardState {
  currentStepIndex: number;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface WizardConfig<TContext extends Context = Context> {
  steps: WizardStep[];
  metadata: Record<string, unknown>;
  confirmationPrompt?: string;
  onComplete: (ctx: TContext, fields: Record<string, unknown>) => Promise<void>;
  onCancel?: (ctx: TContext) => Promise<void>;
}
