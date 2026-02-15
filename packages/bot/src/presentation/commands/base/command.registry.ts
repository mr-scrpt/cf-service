import { Bot, Context } from 'grammy';
import { BotCommand } from './command.interface';

export class CommandRegistry<C extends Context = Context> {
  private commands = new Map<string, BotCommand>();

  register(name: string, command: BotCommand): void {
    if (this.commands.has(name)) {
      throw new Error(`Command ${name} is already registered`);
    }
    this.commands.set(name, command);
  }

  registerAll(commands: BotCommand[]): void {
    commands.forEach((cmd) => this.register(cmd.name, cmd));
  }

  setupBot(bot: Bot<C>): void {
    this.commands.forEach((command, name) => {
      bot.command(name, (ctx: C) => command.execute(ctx));
    });
  }

  getHelpText(): string {
    const lines: string[] = ['📋 <b>Available Commands</b>\n'];

    this.commands.forEach((cmd) => {
      lines.push(`• /${cmd.name} — ${cmd.description}`);
    });

    return lines.join('\n');
  }

  get size(): number {
    return this.commands.size;
  }
}
