import { Bot, Context } from 'grammy';
import { BotCommand } from './command.interface';

export class CommandRegistry {
  private commands = new Map<string, BotCommand>();

  register(command: BotCommand): void {
    if (this.commands.has(command.name)) {
      throw new Error(`Command ${command.name} is already registered`);
    }
    this.commands.set(command.name, command);
  }

  registerAll(commands: BotCommand[]): void {
    commands.forEach((cmd) => this.register(cmd));
  }

  setupBot(bot: Bot<Context>): void {
    this.commands.forEach((command, name) => {
      bot.command(name, (ctx) => command.execute(ctx));
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
