// Config
export { commonEnvSchema, type CommonEnv } from './config';

// Ports
// Ports — Foundation
export type { LoggerPort, NotifierPort } from './foundation/ports';

export {
  LoggerAdapter,
  type LoggerOptions,
  LoggerMode,
  LoggerLevel,
} from './foundation/adapters/logger.adapter';

// Foundation — Logging utilities
export { createLoggingProxy } from './foundation/logging/logging-proxy';

// Errors
export * from './errors';

// Constants (UI presets only)
export * from './constants';
