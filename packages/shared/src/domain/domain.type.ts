import { z } from 'zod';
import { DomainStatus } from './constants.domain';

export const cloudflareDomainSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  status: z.enum(DomainStatus),
  nameservers: z.array(z.string()),
});

export type CloudflareDomain = z.infer<typeof cloudflareDomainSchema>;
