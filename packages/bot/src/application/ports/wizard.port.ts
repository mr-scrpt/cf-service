import { Context, SessionFlavor } from 'grammy';
import { WizardConfig } from '@infrastructure/wizard/wizard.interfaces';
import { SessionData } from '@shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

export interface IWizardEngine {
  start(ctx: SessionContext, config: WizardConfig<SessionContext>): Promise<void>;
  cancel(ctx: Context): Promise<void>;
  handleTextInput(ctx: SessionContext, input: string): Promise<void>;
  handleOptionSelect(ctx: SessionContext, optionValue: unknown): Promise<void>;
  skip(ctx: SessionContext): Promise<void>;
  confirm(ctx: SessionContext): Promise<void>;
  isActive(ctx: SessionContext): Promise<boolean>;
}
