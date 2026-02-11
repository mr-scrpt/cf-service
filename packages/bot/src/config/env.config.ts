import { z } from 'zod';
import { commonEnvSchema } from '@cloudflare-bot/shared';

const botEnvSchema = commonEnvSchema.extend({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  ALLOWED_CHAT_ID: z.coerce.number({ message: 'ALLOWED_CHAT_ID must be a number' }),
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required'),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
});

export const env = botEnvSchema.parse(process.env);
