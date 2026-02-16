import { FieldInputType } from '@domain/dns/strategies/field-config.interface';
import { CommonButtons } from '@infrastructure/ui/components/common-buttons';
import { InlineKeyboardButton } from 'grammy/types';
import { WizardStep } from '../wizard.interfaces';
import { WizardButtonBuilder } from './wizard-button-builder.interface';

/**
 * Builds option buttons for SELECT input type fields.
 * Creates one button per option from the field configuration.
 */
export class SelectButtonBuilder implements WizardButtonBuilder {
  canBuild(step: WizardStep): boolean {
    return (
      step.fieldConfig.inputType === FieldInputType.SELECT &&
      !!step.fieldConfig.options &&
      step.fieldConfig.options.length > 0
    );
  }

  build(step: WizardStep): InlineKeyboardButton[][] {
    if (!step.fieldConfig.options) {
      return [];
    }

    return step.fieldConfig.options.map((option) => [
      CommonButtons.option(option.label, option.value),
    ]);
  }
}
