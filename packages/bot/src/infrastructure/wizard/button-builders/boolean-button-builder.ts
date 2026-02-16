import { FieldInputType } from '@domain/dns/strategies/field-config.interface';
import { CommonButtons } from '@infrastructure/ui/components/common-buttons';
import { InlineKeyboardButton } from 'grammy/types';
import { WizardStep } from '../wizard.interfaces';
import { WizardButtonBuilder } from './wizard-button-builder.interface';

/**
 * Builds Yes/No buttons for BOOLEAN input type fields.
 */
export class BooleanButtonBuilder implements WizardButtonBuilder {
  canBuild(step: WizardStep): boolean {
    return step.fieldConfig.inputType === FieldInputType.BOOLEAN;
  }

  build(_: WizardStep): InlineKeyboardButton[][] {
    return [[CommonButtons.yes(), CommonButtons.no()]];
  }
}
