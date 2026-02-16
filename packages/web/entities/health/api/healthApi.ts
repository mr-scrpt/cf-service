import { apiClient } from '@/shared/api/client';
import type { HealthStatus } from '../model/types';

export const healthApi = {
  check: async (): Promise<HealthStatus> => {
    const { data } = await apiClient.get<HealthStatus>('/health');
    return data;
  },
};
