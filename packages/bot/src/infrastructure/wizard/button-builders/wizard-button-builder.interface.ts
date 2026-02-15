import { InlineKeyboardButton } from 'grammy/types';
import { WizardStep } from '../wizard.interfaces';

/**
 * Strategy interface for building wizard buttons based on field configuration.
 * Each implementation handles a specific input type or button category.
 */
export interface WizardButtonBuilder {
  /**
   * Determines if this builder can create buttons for the given step.
   */
  canBuild(step: WizardStep): boolean;

  /**
   * Builds button rows for the wizard step.
   * Returns array of button rows (each row is an array of buttons).
   */
  build(step: WizardStep): InlineKeyboardButton[][];
}
