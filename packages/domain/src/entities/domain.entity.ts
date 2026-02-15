import { DomainId } from '../value-objects/domain-id.vo';
import { DomainName } from '../value-objects/domain-name.vo';

export enum DomainStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FAILED = 'FAILED',
}

export class Domain {
  private constructor(
    public readonly id: DomainId,
    public readonly name: DomainName,
    public readonly nsServers: string[],
    public readonly zoneId: string,
    private _status: DomainStatus,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(params: {
    id: DomainId;
    name: DomainName;
    nsServers: string[];
    zoneId: string;
  }): Domain {
    return new Domain(
      params.id,
      params.name,
      params.nsServers,
      params.zoneId,
      DomainStatus.PENDING,
      new Date()
    );
  }

  static reconstruct(params: {
    id: DomainId;
    name: DomainName;
    nsServers: string[];
    zoneId: string;
    status: DomainStatus;
    createdAt: Date;
  }): Domain {
    return new Domain(
      params.id,
      params.name,
      params.nsServers,
      params.zoneId,
      params.status,
      params.createdAt
    );
  }

  activate(): void {
    this._status = DomainStatus.ACTIVE;
  }

  markAsFailed(): void {
    this._status = DomainStatus.FAILED;
  }

  get status(): DomainStatus {
    return this._status;
  }
}
