import { IDnsGatewayPort } from '../../ports/dns-gateway.port';
import { ILogger } from '../../ports/logger.port';
import { CreateDnsRecordDto, DnsRecordDto } from '../../dto/dns-record.dto';

export class CreateDnsRecordUseCase {
  constructor(
    private readonly dnsGateway: IDnsGatewayPort,
    private readonly logger: ILogger
  ) {}

  async execute(dto: CreateDnsRecordDto): Promise<DnsRecordDto> {
    this.logger.info('Creating DNS record', { 
      type: dto.type, 
      name: dto.name,
      zoneId: dto.zoneId 
    });

    const record = await this.dnsGateway.createDnsRecord(dto);

    this.logger.info('DNS record created successfully', { 
      id: record.id,
      type: record.type,
      name: record.name
    });

    return record;
  }
}
