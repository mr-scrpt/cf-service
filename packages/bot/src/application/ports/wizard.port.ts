import { Context, SessionFlavor } from 'grammy';
import { WizardConfig } from '@infrastructure/wizard/wizard.interfaces';
import { SessionData } from '@shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

export interface IWizardEngine {
  start(ctx: SessionContext, config: WizardConfig<SessionContext>): Promise<void>;
  cancel(ctx: Context): Promise<void>;
}
