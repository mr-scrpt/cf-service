import { z } from 'zod';
import { Environment } from '@cloudflare-bot/shared';

const apiEnvSchema = z.object({
  NODE_ENV: z.enum([Environment.PRODUCTION, Environment.DEVELOPMENT, Environment.TEST]),
  API_AUTH_TOKEN: z.string().min(1),
  API_PORT: z.coerce.number().int().positive(),
  MONGODB_URI: z.string().min(1),
});

export const env = apiEnvSchema.parse(process.env);
