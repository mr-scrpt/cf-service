import { z } from 'zod';
import { domainNameSchema } from '../domain';

export const registerDomainSchema = z.object({
  name: domainNameSchema,
});

export type RegisterDomainInput = z.input<typeof registerDomainSchema>;
