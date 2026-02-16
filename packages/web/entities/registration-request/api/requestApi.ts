import { apiClient } from '@/shared/api/client';
import type { RegistrationRequest } from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const requestApi = {
  getPending: async (): Promise<RegistrationRequest[]> => {
    const { data } = await apiClient.get<ApiResponse<RegistrationRequest[]>>(
      '/api/registration-requests/pending'
    );
    return data.data || [];
  },

  approve: async (requestId: string): Promise<void> => {
    await apiClient.post(`/api/registration-requests/${requestId}/approve`, {
      reviewedBy: 'admin',
    });
  },

  reject: async (requestId: string): Promise<void> => {
    await apiClient.post(`/api/registration-requests/${requestId}/reject`, {
      reviewedBy: 'admin',
    });
  },
};
