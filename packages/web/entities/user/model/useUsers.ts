import { useQuery } from '@tanstack/react-query';
import { userQueryKeys } from './query-keys';
import { userApi } from '../api/userApi';

export const useUsers = () => {
  return useQuery({
    queryKey: userQueryKeys.getUsers(),
    queryFn: userApi.getAll,
    refetchInterval: 30000,
  });
};
