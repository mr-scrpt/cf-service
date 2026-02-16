import { useQuery } from '@tanstack/react-query';
import { healthQueryKeys } from './query-keys';
import { healthApi } from '../api/healthApi';

export const useHealth = () => {
  return useQuery({
    queryKey: healthQueryKeys.checkHealth(),
    queryFn: healthApi.check,
    refetchInterval: 30000,
    retry: 1,
  });
};
