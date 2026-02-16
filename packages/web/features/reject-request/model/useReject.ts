import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MessageInstance } from 'antd/es/message/interface';
import { requestApi, registrationRequestQueryKeys } from '@/entities/registration-request';

export const useReject = (messageApi: MessageInstance) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: requestApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationRequestQueryKeys.getPending() });
      messageApi.success('Request rejected');
    },
    onError: () => {
      messageApi.error('Failed to reject request');
    },
  });

  return {
    reject: mutation.mutate,
    isRejecting: mutation.isPending,
  };
};
