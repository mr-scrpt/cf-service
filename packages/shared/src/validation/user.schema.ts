import { z } from 'zod';
import { userSchema } from '../domain';

export const createUserSchema = userSchema.pick({
  telegramId: true,
  username: true,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
