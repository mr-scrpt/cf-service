import { CallbackAction } from '../../shared/constants';
import { CallbackHandler, ParsedCallback, SessionContext } from './callback-handler.interface';
import { logger } from '../../shared/utils/logger';

export class CallbackRouter {
  private handlers = new Map<CallbackAction, CallbackHandler<unknown>>();

  register<TPayload = void>(action: CallbackAction, handler: CallbackHandler<TPayload>): this {
    if (this.handlers.has(action)) {
      throw new Error(`Handler for ${action} already registered`);
    }
    this.handlers.set(action, handler);
    logger.debug(`Registered callback handler`, { action });
    return this;
  }

  registerAll(handlers: Array<{ action: CallbackAction; handler: CallbackHandler<unknown> }>): this {
    logger.debug(`Registering ${handlers.length} callback handlers...`);
    handlers.forEach(({ action, handler }) => this.register(action, handler));
    logger.debug(`All handlers registered. Total: ${this.handlers.size}`);
    return this;
  }

  async route(ctx: SessionContext): Promise<void> {
    if (!ctx.callbackQuery?.data) {
      await ctx.answerCallbackQuery({ text: '❌ Invalid callback' });
      return;
    }

    const callbackData = ctx.callbackQuery.data;
    logger.debug('Callback received', { 
      callback_data: callbackData,
      registered_handlers: Array.from(this.handlers.keys())
    });

    const parsed = this.parseCallbackData(callbackData);
    logger.debug('Parsed callback', { 
      action: parsed.action, 
      payload: parsed.payload 
    });

    const handler = this.handlers.get(parsed.action as CallbackAction);

    if (!handler) {
      logger.warn('No handler found for action', { 
        action: parsed.action,
        available_actions: Array.from(this.handlers.keys())
      });
      await ctx.answerCallbackQuery({ text: '❌ Unknown action' });
      return;
    }

    try {
      await handler.handle(ctx, parsed.payload);
      await ctx.answerCallbackQuery();
    } catch (error) {
      await ctx.answerCallbackQuery({ text: '❌ Error occurred' });
      throw error;
    }
  }

  private parseCallbackData(data: string): ParsedCallback {
    // Try to find JSON payload (starts with { or [ or ")
    const jsonStartChars = ['{', '[', '"'];
    let payloadStartIndex = -1;

    for (const char of jsonStartChars) {
      const index = data.lastIndexOf(`:${char}`);
      if (index !== -1 && (payloadStartIndex === -1 || index < payloadStartIndex)) {
        payloadStartIndex = index;
      }
    }

    if (payloadStartIndex === -1) {
      // No JSON payload found, entire string is the action
      return {
        action: data,
        payload: undefined,
      };
    }

    const action = data.substring(0, payloadStartIndex);
    const payloadString = data.substring(payloadStartIndex + 1);

    try {
      const payload = JSON.parse(payloadString);
      return { action, payload };
    } catch {
      // If parsing fails, treat entire string as action
      return { action: data, payload: undefined };
    }
  }

  has(action: CallbackAction): boolean {
    return this.handlers.has(action);
  }
}
