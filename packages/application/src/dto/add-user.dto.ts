import { z } from 'zod';

export const addUserDtoSchema = z.object({
  telegramId: z.number().int().positive(),
  username: z.string().optional(),
});

export type AddUserDto = z.infer<typeof addUserDtoSchema>;

export interface UserDto {
  id: string;
  telegramId: number;
  username: string | null;
  isAllowed: boolean;
  createdAt: Date;
}
