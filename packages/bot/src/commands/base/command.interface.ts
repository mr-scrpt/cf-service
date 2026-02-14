import { Context } from 'grammy';

export interface BotCommand<C extends Context = Context> {
  readonly name: string;

  readonly description: string;

  execute(ctx: C): Promise<void>;
}
