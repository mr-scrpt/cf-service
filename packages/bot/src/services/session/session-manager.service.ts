import { Context, SessionFlavor } from 'grammy';
import { SessionKey } from '../../shared/constants';
import { SessionData } from '../../shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class SessionManager {
  async get<T>(ctx: SessionContext, key: SessionKey): Promise<T | undefined> {
    if (!ctx.session) {
      return undefined;
    }
    return ctx.session[key] as T | undefined;
  }

  async set<T>(ctx: SessionContext, key: SessionKey, value: T): Promise<void> {
    if (!ctx.session) {
      throw new Error('Session not initialized');
    }
    (ctx.session[key] as T) = value;
  }

  async update<T>(
    ctx: SessionContext,
    key: SessionKey,
    updater: (current: T | undefined) => T
  ): Promise<void> {
    const current = await this.get<T>(ctx, key);
    const updated = updater(current);
    await this.set(ctx, key, updated);
  }

  async clear(ctx: SessionContext, key: SessionKey): Promise<void> {
    if (ctx.session) {
      delete ctx.session[key];
    }
  }

  async clearAll(ctx: SessionContext): Promise<void> {
    if (ctx.session) {
      Object.values(SessionKey).forEach((key) => {
        delete ctx.session[key];
      });
    }
  }

  async has(ctx: SessionContext, key: SessionKey): Promise<boolean> {
    if (!ctx.session) {
      return false;
    }
    return key in ctx.session && ctx.session[key] !== undefined;
  }
}
