export { Environment } from './config';
export { commonEnvSchema, type CommonEnv } from './config';

export { DnsRecordType, DomainStatus } from './domain';

export type { User } from './domain';
export type { CloudflareDomain } from './domain';
export type { DnsRecord } from './domain';

export {
  domainNameSchema,
  registerDomainSchema,
  createDnsRecordSchema,
  updateDnsRecordSchema,
  createUserSchema,
} from './validation';

export type {
  RegisterDomainInput,
  CreateDnsRecordInput,
  UpdateDnsRecordInput,
  CreateUserInput,
} from './validation';
