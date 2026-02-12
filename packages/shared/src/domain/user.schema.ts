import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  telegramId: z.number().int().positive(),
  username: z.string().min(1),
  isAllowed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
