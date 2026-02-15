import { z } from 'zod';
import { Environment } from './constants.config';

const mongoSchema = z.object({
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  NODE_ENV: z.enum(Environment).default(Environment.Development),
});

const cloudflareSchema = z.object({
  CLOUDFLARE_API_URL: z.url(),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
});

export const commonEnvSchema = z.object({
  ...mongoSchema.shape,
  ...cloudflareSchema.shape,
});

export type CommonEnv = z.infer<typeof commonEnvSchema>;
export type CloudflareEnv = z.infer<typeof cloudflareSchema>;
