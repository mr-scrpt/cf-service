import { z } from 'zod';
import { Environment } from './constants.config';

export const commonEnvSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  NODE_ENV: z.enum(Environment).default(Environment.Development),

  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_ZONE_ID: z.string().min(1),
});

export type CommonEnv = z.infer<typeof commonEnvSchema>;
