import { z } from 'zod';

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
});

export type ZoneData = z.infer<typeof zoneSchema>;
