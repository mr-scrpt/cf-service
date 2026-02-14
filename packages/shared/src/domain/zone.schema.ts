import { z } from 'zod';

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  account: z.object({
    id: z.string(),
    name: z.string(),
  }),
  nameServers: z.array(z.string()),
});
