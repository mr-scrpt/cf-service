import { z } from 'zod';

export const createUserSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z
    .string()
    .min(1)
    .regex(/^@?[a-zA-Z0-9_]+$/, 'Invalid Telegram username'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
