import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MessageInstance } from 'antd/es/message/interface';
import { requestApi, registrationRequestQueryKeys } from '@/entities/registration-request';
import { userQueryKeys } from '@/entities/user';

export const useApprove = (messageApi: MessageInstance) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: requestApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationRequestQueryKeys.getPending() });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.getUsers() });
      messageApi.success('Request approved successfully');
    },
    onError: () => {
      messageApi.error('Failed to approve request');
    },
  });

  return {
    approve: mutation.mutate,
    isApproving: mutation.isPending,
  };
};
