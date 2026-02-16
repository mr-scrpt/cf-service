import { z } from 'zod';
import { userSchema } from '../user.schema';
import { domainNameSchema } from '../domain.schema';

export const createUserSchema = userSchema.pick({
  telegramId: true,
  username: true,
});

export const registerDomainSchema = z.object({
  name: domainNameSchema,
});

export type CreateUserInput = z.input<typeof createUserSchema>;
export type RegisterDomainInput = z.input<typeof registerDomainSchema>;
