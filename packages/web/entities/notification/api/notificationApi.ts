import { apiClient } from '@/shared/api/client';
import type { NotificationPayload } from '../model/types';

interface ApiResponse {
  success: boolean;
  message?: string;
}

export const notificationApi = {
  send: async (payload: NotificationPayload): Promise<void> => {
    await apiClient.post<ApiResponse>('/api/notify', payload);
  },
};
