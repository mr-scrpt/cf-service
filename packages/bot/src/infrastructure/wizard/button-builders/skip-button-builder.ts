import { InlineKeyboardButton } from 'grammy/types';
import { WizardButtonBuilder } from './wizard-button-builder.interface';
import { WizardStep } from '../wizard.interfaces';
import { CommonButtons } from '@infrastructure/ui/components/common-buttons';

/**
 * Builds Skip button for optional (non-required) fields.
 */
export class SkipButtonBuilder implements WizardButtonBuilder {
  canBuild(step: WizardStep): boolean {
    return !step.fieldConfig.required;
  }

  build(step: WizardStep): InlineKeyboardButton[][] {
    return [[CommonButtons.skip()]];
  }
}
