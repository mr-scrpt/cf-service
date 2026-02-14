import { Context } from 'grammy';

export interface BotCommand {
  readonly name: string;

  readonly description: string;

  execute(ctx: Context): Promise<void>;
}
