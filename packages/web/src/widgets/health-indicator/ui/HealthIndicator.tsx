'use client';

import { Badge, Spin } from 'antd';
import { useHealthCheck } from '../model/useHealthCheck';

export const HealthIndicator = () => {
  const { status, isLoading } = useHealthCheck();

  if (isLoading) {
    return <Spin size="small" />;
  }

  const statusConfig: Record<typeof status, { status: 'success' | 'error' | 'default'; text: string }> = {
    online: { status: 'success' as const, text: 'API Online' },
    error: { status: 'error' as const, text: 'API Offline' },
    unknown: { status: 'default' as const, text: 'Unknown' },
  };

  const config = statusConfig[status];

  return (
    <Badge status={config.status} text={config.text} />
  );
};
