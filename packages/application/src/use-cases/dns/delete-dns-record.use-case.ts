import { IDnsGatewayPort } from '../../ports/dns-gateway.port';
import { ILogger } from '../../ports/logger.port';

export class DeleteDnsRecordUseCase {
  constructor(
    private readonly dnsGateway: IDnsGatewayPort,
    private readonly logger: ILogger
  ) {}

  async execute(zoneId: string, recordId: string): Promise<void> {
    this.logger.info('Deleting DNS record', { 
      zoneId,
      recordId
    });

    await this.dnsGateway.deleteDnsRecord(zoneId, recordId);

    this.logger.info('DNS record deleted successfully', { 
      recordId
    });
  }
}
