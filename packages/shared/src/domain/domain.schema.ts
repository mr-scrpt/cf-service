import { z } from 'zod';
import { DomainStatus } from './constants.domain';

export const domainNameSchema = z
  .string()
  .min(3)
  .regex(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Invalid domain name format');

export const domainSchema = z.object({
  id: z.string(),
  name: domainNameSchema,
  status: z.enum(DomainStatus),
  nameservers: z.array(z.string()),
});
