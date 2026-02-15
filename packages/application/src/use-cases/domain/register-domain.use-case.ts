import { DomainName, IDomainRepository } from '@cloudflare-bot/domain';
import { ICloudflareGateway } from '../../ports/cloudflare-gateway.port';
import { RegisterDomainDto, RegisterDomainResult, registerDomainDtoSchema } from '../../dto/register-domain.dto';

export class RegisterDomainUseCase {
  constructor(
    private readonly cloudflareGateway: ICloudflareGateway,
    private readonly domainRepository: IDomainRepository
  ) {}

  async execute(dto: RegisterDomainDto): Promise<RegisterDomainResult> {
    const validated = registerDomainDtoSchema.parse(dto);
    
    const domainName = DomainName.create(validated.domain);
    
    const existingDomain = await this.domainRepository.findByName(domainName);
    if (existingDomain) {
      throw new Error('Domain already registered');
    }
    
    const domain = await this.cloudflareGateway.createZone(domainName);
    
    await this.domainRepository.save(domain);
    
    return {
      domain: domain.name.toString(),
      nsServers: domain.nsServers,
      zoneId: domain.zoneId,
    };
  }
}
