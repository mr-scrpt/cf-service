import { IDnsGatewayPort } from '../../ports/dns-gateway.port';
import { ILogger } from '../../ports/logger.port';
import { UpdateDnsRecordDto, DnsRecordDto } from '../../dto/dns-record.dto';

export class UpdateDnsRecordUseCase {
  constructor(
    private readonly dnsGateway: IDnsGatewayPort,
    private readonly logger: ILogger
  ) {}

  async execute(zoneId: string, recordId: string, dto: UpdateDnsRecordDto): Promise<DnsRecordDto> {
    this.logger.info('Updating DNS record', { 
      zoneId,
      recordId,
      type: dto.type,
      name: dto.name
    });

    const record = await this.dnsGateway.updateDnsRecord(zoneId, recordId, dto);

    this.logger.info('DNS record updated successfully', { 
      id: record.id,
      type: record.type,
      name: record.name
    });

    return record;
  }
}
