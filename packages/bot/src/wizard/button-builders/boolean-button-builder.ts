import { InlineKeyboardButton } from 'grammy/types';
import { WizardButtonBuilder } from './wizard-button-builder.interface';
import { WizardStep } from '../wizard.interfaces';
import { FieldInputType } from '../../strategies/field-config.interface';
import { CommonButtons } from '../../ui/components/common-buttons';

/**
 * Builds Yes/No buttons for BOOLEAN input type fields.
 */
export class BooleanButtonBuilder implements WizardButtonBuilder {
  canBuild(step: WizardStep): boolean {
    return step.fieldConfig.inputType === FieldInputType.BOOLEAN;
  }

  build(step: WizardStep): InlineKeyboardButton[][] {
    return [[CommonButtons.yes(), CommonButtons.no()]];
  }
}
