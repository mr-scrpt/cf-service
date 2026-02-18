import { BotInitializer, InitializationContext, BotContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { BotEvent } from '@shared/constants';

export class RoutingInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    if (!context.flows) {
      throw new Error('flows not initialized');
    }
    if (!context.wizardEngine) {
      throw new Error('wizardEngine not initialized');
    }

    const handlersConfigurator = context.botContainer.getHandlersConfigurator();
    const { callbackRouter, textInputRouter } = handlersConfigurator.configureHandlers(
      context.flows,
      context.wizardEngine,
      context.container
    );

    context.bot.on(BotEvent.CALLBACK_QUERY, async (ctx: BotContext) => {
      await callbackRouter.route(ctx);
    });

    context.bot.on(BotEvent.MESSAGE_TEXT, async (ctx: BotContext, next) => {
      const text = ctx.message?.text;
      if (!text) {
        await next();
        return;
      }
      
      const handled = await textInputRouter.route(ctx, text);
      if (!handled) {
        await next();
      }
    });
  }
}
