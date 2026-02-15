import { z } from 'zod';

export const addUserDtoSchema = z.object({
  username: z.string().min(1),
});

export type AddUserDto = z.infer<typeof addUserDtoSchema>;

export interface UserDto {
  id: string;
  telegramId: number;
  username: string;
  isAllowed: boolean;
  createdAt: Date;
}
