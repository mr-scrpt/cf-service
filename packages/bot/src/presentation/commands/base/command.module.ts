import { IDnsGatewayPort } from '@cloudflare-bot/application';
import { Context } from 'grammy';
import { BotCommand } from './command.interface';
import { CommandRegistry } from './command.registry';

// Import commands
import { RegisterDomainCommand } from '@presentation/commands/domain/register-domain.command';
import { ListDomainsCommand } from '@presentation/commands/domain/list-domain.command';
import { CreateDnsCommand } from '@presentation/commands/dns/create-dns.command';
import { StartCommand } from '@presentation/commands/general/start.command';

/**
 * Command module - handles dependency injection and registration
 * Follows Dependency Inversion Principle
 */
export class CommandModule<C extends Context = Context> {
  private readonly registry = new CommandRegistry<C>();

  constructor(private readonly gateway: IDnsGatewayPort) {
    this.registerCommands();
  }

  private registerCommands(): void {
    const commands: BotCommand[] = [
      new RegisterDomainCommand(this.gateway),
      new ListDomainsCommand(this.gateway),
      new CreateDnsCommand(this.gateway),
      new StartCommand(),
    ];

    commands.forEach((command) => {
      this.registry.register(command.name, command);
    });
  }

  getRegistry(): CommandRegistry<C> {
    return this.registry;
  }
}
