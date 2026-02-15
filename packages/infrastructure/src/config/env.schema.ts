import { z } from 'zod';

export const envSchema = z.object({
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  ALLOWED_CHAT_ID: z.string().transform(Number),
  
  MONGODB_URI: z.string().min(1),
  
  API_AUTH_TOKEN: z.string().min(1),
  API_PORT: z.string().default('3000').transform(Number),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;
