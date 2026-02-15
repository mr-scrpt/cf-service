import { z } from 'zod';
import { Environment } from '@cloudflare-bot/shared';

const botEnvSchema = z.object({
  NODE_ENV: z.enum([Environment.PRODUCTION, Environment.DEVELOPMENT, Environment.TEST]),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  ALLOWED_CHAT_ID: z.coerce.number().int(),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_API_URL: z.string().url(),
});

export const env = botEnvSchema.parse(process.env);
