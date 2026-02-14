import { FieldConfig, FieldInputType } from '../strategies/field-config.interface';
import { ValidationResult } from '../strategies/dns-record-strategy.interface';

export class WizardValidator {
  validate(fieldConfig: FieldConfig, input: string): ValidationResult {
    let parsedInput: unknown = input;

    if (fieldConfig.inputType === FieldInputType.NUMBER) {
      parsedInput = Number(input);
      if (isNaN(parsedInput as number)) {
        return {
          success: false,
          error: 'Invalid number format',
        };
      }
    } else if (fieldConfig.inputType === FieldInputType.BOOLEAN) {
      parsedInput = input.toLowerCase() === 'true' || input === '1';
    }

    const result = fieldConfig.validationSchema.safeParse(parsedInput);

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
}
