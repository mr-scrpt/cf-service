import { z } from 'zod';

export const registerDomainDtoSchema = z.object({
  domain: z.string().min(1),
});

export type RegisterDomainDto = z.infer<typeof registerDomainDtoSchema>;

export interface RegisterDomainResult {
  domain: string;
  nsServers: string[];
  zoneId: string;
}
