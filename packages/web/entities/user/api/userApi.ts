import { apiClient } from '@/shared/api/client';
import type { User } from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<ApiResponse<User[]>>('/api/users');
    return data.data;
  },

  remove: async (telegramId: number): Promise<void> => {
    await apiClient.delete(`/api/users/${telegramId}`);
  },
};
