import { useQuery } from '@tanstack/react-query';
import { registrationRequestQueryKeys } from './query-keys';
import { requestApi } from '../api/requestApi';

export const useRequests = () => {
  return useQuery({
    queryKey: registrationRequestQueryKeys.getPending(),
    queryFn: requestApi.getPending,
    refetchInterval: 30000,
  });
};
