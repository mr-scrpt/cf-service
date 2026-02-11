import { DomainStatus } from './constants.domain';

export interface CloudflareDomain {
  id: string;
  name: string;
  status: DomainStatus;
  nameservers: string[];
}
