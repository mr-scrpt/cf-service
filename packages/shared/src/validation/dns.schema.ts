import { z } from 'zod';
import {
  standardRecordSchema,
  mxRecordSchema,
  srvRecordSchema,
} from '../domain/dns-record.schema';

export const createDnsRecordSchema = z.discriminatedUnion('type', [
  standardRecordSchema.omit({ id: true }),
  mxRecordSchema.omit({ id: true }),
  srvRecordSchema.omit({ id: true }),
]);

export const updateDnsRecordSchema = z.discriminatedUnion('type', [
  standardRecordSchema.omit({ id: true }),
  mxRecordSchema.omit({ id: true }),
  srvRecordSchema.omit({ id: true }),
]);

export type CreateDnsRecordInput = z.input<typeof createDnsRecordSchema>;
export type UpdateDnsRecordInput = z.input<typeof updateDnsRecordSchema>;
