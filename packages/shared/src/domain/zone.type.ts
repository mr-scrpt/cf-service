import { z } from 'zod';
import { zoneIdSchema } from './domain.schema';
import { zoneSchema } from './zone.schema';

export type ZoneIdSchema = z.infer<typeof zoneIdSchema>;
