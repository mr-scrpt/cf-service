import { z } from 'zod';
import { Environment } from './constants.config';

export const commonEnvSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  NODE_ENV: z.nativeEnum(Environment).default(Environment.Development),
});

export type CommonEnv = z.infer<typeof commonEnvSchema>;
