import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../../shared/types';

export type SessionContext = Context & SessionFlavor<SessionData>;

export interface CallbackHandler<TPayload = void> {
  handle(ctx: SessionContext, payload: TPayload): Promise<void>;
}

export interface ParsedCallback {
  action: string;
  payload: unknown;
}
