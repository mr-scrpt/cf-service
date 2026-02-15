// Config
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
export * from './validation';
export * from './validation/adapters';

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

export {
  LoggerAdapter,
  type LoggerOptions,
  LoggerMode,
  LoggerLevel,
} from './foundation/adapters/logger.adapter';
export * from './infrastructure/cloudflare/adapters/gateway.adapter';
export * from './infrastructure/cloudflare/schemas';

// Foundation — Logging utilities
export { createLoggingProxy } from './foundation/logging/logging-proxy';

// Domain
export * from './domain';

// Re-export primitive schemas for external use
export { zoneIdSchema } from './domain/domain.schema';
export { 
  dnsRecordNameSchema, 
  dnsRecordContentSchema, 
  ttlSchema,
  type StandardRecord,
  type MXRecord,
  type SRVRecord,
  type StandardRecordFieldKey,
  type MXRecordFieldKey,
  type SRVRecordFieldKey,
  type DnsRecordFieldKey,
} from './domain/dns-record.schema';

// Errors
export * from './errors';

// Adapters
export { CloudflareGatewayAdapter } from './infrastructure';

export {
  TTL_VALUES,
  PROXIABLE_TYPES,
  isProxiable,
  type ProxiableRecordType,
} from './domain/constants.domain';

export * from './constants';
