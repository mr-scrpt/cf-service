import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { Context } from 'grammy';
import { BotCommand } from './command.interface';
import { CommandRegistry } from './command.registry';

// Import commands
import { RegisterDomainCommand } from '../domain/register-domain.command';
import { ListDomainsCommand } from '../domain/list-domain.command';
import { CreateDnsCommand } from '../dns/create-dns.command';
import { StartCommand } from '../general/start.command';

/**
 * Command module - handles dependency injection and registration
 * Follows Dependency Inversion Principle
 */
export class CommandModule<C extends Context = Context> {
  private readonly registry = new CommandRegistry<C>();

  constructor(private readonly gateway: DnsGatewayPort) {
    this.registerCommands();
  }

  private registerCommands(): void {
    const commands: BotCommand<C>[] = [
      new RegisterDomainCommand(this.gateway) as BotCommand<C>,
      new ListDomainsCommand(this.gateway) as BotCommand<C>,
      new CreateDnsCommand(this.gateway) as BotCommand<C>,
      new StartCommand() as BotCommand<C>,
    ];

    this.registry.registerAll(commands);
  }

  getRegistry(): CommandRegistry<C> {
    return this.registry;
  }
}
