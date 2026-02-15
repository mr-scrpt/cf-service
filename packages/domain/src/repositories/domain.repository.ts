import { Domain } from '../entities/domain.entity';
import { DomainId } from '../value-objects/domain-id.vo';
import { DomainName } from '../value-objects/domain-name.vo';

export interface IDomainRepository {
  findById(id: DomainId): Promise<Domain | null>;
  findByName(name: DomainName): Promise<Domain | null>;
  findAll(): Promise<Domain[]>;
  save(domain: Domain): Promise<void>;
  delete(id: DomainId): Promise<void>;
}
