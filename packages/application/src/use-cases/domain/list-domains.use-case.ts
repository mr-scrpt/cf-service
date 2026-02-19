import { IDnsGatewayPort } from '../../ports/dns-gateway.port';
import { ILogger } from '../../ports/logger.port';
import { DomainDto } from '../../dto/domain.dto';

export class ListDomainsUseCase {
  constructor(
    private readonly dnsGateway: IDnsGatewayPort,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<DomainDto[]> {
    this.logger.debug('Listing domains');

    const domains = await this.dnsGateway.listDomains();

    this.logger.debug('Domains retrieved', { count: domains.length });

    return domains;
  }
}
