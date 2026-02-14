import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { BotCommand } from './command.interface';
import { CommandRegistry } from './command.registry';

// Import commands
import { RegisterDomainCommand } from '../domain/register-domain.command';
import { ListDomainsCommand } from '../domain/list-domain.command';
import { CreateDnsCommand } from '../dns/create-dns.command';

/**
 * Command module - handles dependency injection and registration
 * Follows Dependency Inversion Principle
 */
export class CommandModule {
  private readonly registry = new CommandRegistry();

  constructor(private readonly gateway: DnsGatewayPort) {
    this.registerCommands();
  }

  private registerCommands(): void {
    const commands: BotCommand[] = [
      // Domain commands
      new RegisterDomainCommand(this.gateway),
      new ListDomainsCommand(this.gateway),

      // DNS commands
      new CreateDnsCommand(this.gateway),
    ];

    this.registry.registerAll(commands);
  }

  getRegistry(): CommandRegistry {
    return this.registry;
  }
}
