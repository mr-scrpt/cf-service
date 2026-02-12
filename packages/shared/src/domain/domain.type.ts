import { z } from 'zod';
import { domainNameSchema, domainSchema } from './domain.schema';

export type Domain = z.infer<typeof domainSchema>;
export type DomainName = z.infer<typeof domainNameSchema>;
