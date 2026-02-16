import { BotInitializer, InitializationContext, BotContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { MiddlewareConfigurator } from '@infrastructure/bootstrap/middleware.configurator';
import { HandlersConfigurator } from '@infrastructure/bootstrap/handlers.configurator';
import { BotEvent } from '@shared/constants';

export class RoutingInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    const middlewareConfigurator = new MiddlewareConfigurator();
    middlewareConfigurator.configureMiddleware(context.bot, context.container);

    const handlersConfigurator = new HandlersConfigurator();
    const { callbackRouter, textInputRouter } = handlersConfigurator.configureHandlers(
      context.dependencies!.flows,
      context.dependencies!.wizardEngine,
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
