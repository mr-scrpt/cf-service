import { Domain, DomainId, DomainName, DomainStatus, IDomainRepository } from '@cloudflare-bot/domain';
import { DomainModel, DomainDocument } from '../models/domain.model';

export class MongoDomainRepository implements IDomainRepository {
  async findById(id: DomainId): Promise<Domain | null> {
    const doc = await DomainModel.findById(id.toString());
    return doc ? this.toDomain(doc) : null;
  }

  async findByName(name: DomainName): Promise<Domain | null> {
    const doc = await DomainModel.findOne({ name: name.toString() });
    return doc ? this.toDomain(doc) : null;
  }

  async findAll(): Promise<Domain[]> {
    const docs = await DomainModel.find();
    return docs.map(doc => this.toDomain(doc));
  }

  async save(domain: Domain): Promise<void> {
    await DomainModel.findByIdAndUpdate(
      domain.id.toString(),
      this.toPersistence(domain),
      { upsert: true, new: true }
    );
  }

  async delete(id: DomainId): Promise<void> {
    await DomainModel.findByIdAndDelete(id.toString());
  }

  private toDomain(doc: DomainDocument): Domain {
    return Domain.reconstruct({
      id: DomainId.create(doc._id),
      name: DomainName.create(doc.name),
      nsServers: doc.nsServers,
      zoneId: doc.zoneId,
      status: doc.status as DomainStatus,
      createdAt: doc.createdAt,
    });
  }

  private toPersistence(domain: Domain): Partial<DomainDocument> {
    return {
      _id: domain.id.toString(),
      name: domain.name.toString(),
      nsServers: domain.nsServers,
      zoneId: domain.zoneId,
      status: domain.status,
      createdAt: domain.createdAt,
    };
  }
}
