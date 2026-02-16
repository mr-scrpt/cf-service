import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { userApi, userQueryKeys } from '@/entities/user';

export const useRemoveUser = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  const mutation = useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.getUsers() });
      messageApi.success('User removed successfully');
    },
    onError: () => {
      messageApi.error('Failed to remove user');
    },
  });

  return {
    removeUser: mutation.mutate,
    isRemoving: mutation.isPending,
    contextHolder,
  };
};
