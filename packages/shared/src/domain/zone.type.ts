import { z } from 'zod';
import { zoneIdSchema } from './domain.schema';

export type ZoneIdSchema = z.infer<typeof zoneIdSchema>;
