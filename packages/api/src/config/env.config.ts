import { z } from 'zod';
import { commonEnvSchema } from '@cloudflare-bot/shared';

const apiEnvSchema = commonEnvSchema.extend({
  API_PORT: z.coerce.number().default(3000),
  API_JWT_SECRET: z.string().min(1, 'API_JWT_SECRET is required'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  ALLOWED_CHAT_ID: z.coerce.number({ message: 'ALLOWED_CHAT_ID must be a number' }),
});

export const env = apiEnvSchema.parse(process.env);
