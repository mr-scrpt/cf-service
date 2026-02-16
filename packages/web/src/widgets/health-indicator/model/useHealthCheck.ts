'use client';

import { useHealth } from '@/entities/health';

export const useHealthCheck = () => {
  const { data, isLoading, isError } = useHealth();

  const status = isError ? 'error' : data?.status === 'ok' ? 'online' : 'unknown';

  return { status, isLoading };
};
