import { InlineKeyboardButton } from 'grammy/types';
import { WizardButtonBuilder } from './wizard-button-builder.interface';
import { WizardStep } from '../wizard.interfaces';
import { FieldInputType } from '../../strategies/field-config.interface';
import { CommonButtons } from '../../ui/components/common-buttons';

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
