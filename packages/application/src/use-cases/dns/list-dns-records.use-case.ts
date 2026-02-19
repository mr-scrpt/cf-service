import { IDnsGatewayPort } from '../../ports/dns-gateway.port';
import { ILogger } from '../../ports/logger.port';
import { DnsRecordDto } from '../../dto/dns-record.dto';

export class ListDnsRecordsUseCase {
  constructor(
    private readonly dnsGateway: IDnsGatewayPort,
    private readonly logger: ILogger
  ) {}

  async execute(zoneId: string): Promise<DnsRecordDto[]> {
    this.logger.debug('Listing DNS records', { zoneId });

    const records = await this.dnsGateway.listDnsRecords(zoneId);

    this.logger.debug('DNS records retrieved', { 
      zoneId,
      count: records.length 
    });

    return records;
  }
}
