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
// Ports — Foundation
export type { LoggerPort, NotifierPort } from './foundation/ports';
// Ports — Domain
export type { DnsGatewayPort, UserRepositoryPort } from './domain/ports';

export { LoggerAdapter, type LoggerOptions, LoggerMode, LoggerLevel } from './foundation/adapters/logger.adapter';

// Errors
export { AppError } from './errors/app-error';
