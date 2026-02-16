'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { notificationApi } from '@/entities/notification';

export const useNotificationSender = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const sendMutation = useMutation({
    mutationFn: notificationApi.send,
    onSuccess: () => {
      messageApi.success('Test notification sent successfully!');
      setIsModalOpen(false);
    },
    onError: () => {
      messageApi.error('Failed to send notification');
    },
  });

  return {
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    sendNotification: sendMutation.mutate,
    isSending: sendMutation.isPending,
    contextHolder,
  };
};
