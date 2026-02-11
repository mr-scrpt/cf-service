import { z } from 'zod';

export const domainNameSchema = z
  .string()
  .min(3)
  .regex(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Invalid domain name format');

export const registerDomainSchema = z.object({
  name: domainNameSchema,
});

export type RegisterDomainInput = z.infer<typeof registerDomainSchema>;
