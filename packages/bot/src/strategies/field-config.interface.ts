import { z } from 'zod';

export enum FieldInputType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export interface SelectOption {
  label: string;
  value: unknown;
  description?: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  prompt: string;
  required: boolean;
  inputType: FieldInputType;
  validationSchema: z.ZodSchema;
  defaultValue?: unknown;
  options?: SelectOption[];
  helpText?: string;
  placeholder?: string;
}
