import { z } from 'zod';
import { RequestStatus } from '@cloudflare-bot/domain';

export const createRegistrationRequestDtoSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().optional().nullable(),
});

export type CreateRegistrationRequestDto = z.infer<typeof createRegistrationRequestDtoSchema>;

export const reviewRegistrationRequestDtoSchema = z.object({
  requestId: z.string().uuid(),
  reviewedBy: z.string().min(1),
});

export type ReviewRegistrationRequestDto = z.infer<typeof reviewRegistrationRequestDtoSchema>;

export interface RegistrationRequestDto {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName: string | null;
  status: RequestStatus;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
}
