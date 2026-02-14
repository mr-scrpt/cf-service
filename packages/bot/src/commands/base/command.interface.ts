import { Context } from 'grammy';
import { CommandName } from '../../constants';

export interface BotCommand<C extends Context = Context> {
  readonly name: CommandName;

  readonly description: string;

  execute(ctx: C, payload?: unknown): Promise<void>;
}
