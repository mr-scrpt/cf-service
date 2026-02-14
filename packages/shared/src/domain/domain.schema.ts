import { z } from 'zod';
import { DomainStatus } from './constants.domain';

export const domainNameSchema = z
  .string()
  .min(3, 'Domain must be at least 3 characters')
  .max(253, 'Domain too long')
  .regex(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/, 'Invalid domain name format');

export const zoneIdSchema = z
  .string()
  .length(32, 'Zone ID must be 32 characters')
  .regex(/^[a-f0-9]{32}$/, 'Zone ID must be hexadecimal');

export const domainSchema = z.object({
  id: z.string(),
  name: domainNameSchema,
  status: z.enum(DomainStatus),
  nameservers: z.array(z.string()),
});
