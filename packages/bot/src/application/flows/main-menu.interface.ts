import { Context, SessionFlavor } from 'grammy';
import { KeyboardBuilder } from '@infrastructure/ui/components';
import { SessionData } from '@shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

export interface IMainMenu {
  show(ctx: SessionContext): Promise<void>;
  getMainMenuKeyboard(): KeyboardBuilder;
}
