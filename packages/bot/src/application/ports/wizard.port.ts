import { Context } from 'grammy';
import { WizardConfig } from '@infrastructure/wizard/wizard.interfaces';

export interface IWizardEngine {
  start(ctx: Context, config: WizardConfig): Promise<void>;
  cancel(ctx: Context): Promise<void>;
}
