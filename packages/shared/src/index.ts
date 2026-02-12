// Config
export { Environment } from './config';
export { commonEnvSchema, type CommonEnv } from './config';

// Domain — constants
export { DnsRecordType, DomainStatus } from './domain';

// Domain — schemas & entities
export { domainNameSchema, domainSchema, type Domain } from './domain';
export { userSchema, type User } from './domain';
export { dnsRecordSchema, type DnsRecord } from './domain';

export {
  createUserSchema,
  registerDomainSchema,
  createDnsRecordSchema,
  updateDnsRecordSchema,
} from './validation';

// Validation — inferred types (DTO)
export type {
  CreateUserInput,
  RegisterDomainInput,
  CreateDnsRecordInput,
  UpdateDnsRecordInput,
} from './validation';

// Ports
export type { IDnsGateway, IUserRepository, ILogger, INotifier } from './ports';

export { createLogger, type LoggerOptions, LoggerMode, LoggerLevel } from './foundation/logger';

// Errors
export { AppError } from './errors/app-error';
