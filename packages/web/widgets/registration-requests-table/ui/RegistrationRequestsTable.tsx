'use client';

import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRequests, type RegistrationRequest } from '@/entities/registration-request';
import { useApprove } from '@/features/approve-request';
import { useReject } from '@/features/reject-request';

const { Title } = Typography;

export const RegistrationRequestsTable = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const { data: requests = [], isLoading } = useRequests();
  const { approve, isApproving } = useApprove(messageApi);
  const { reject, isRejecting } = useReject(messageApi);
  
  const isProcessing = isApproving || isRejecting;

  const columns: ColumnsType<RegistrationRequest> = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => `@${username}`,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName}${record.lastName ? ' ' + record.lastName : ''}`,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 120,
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Approve request"
            description="Add this user to allowed list?"
            onConfirm={() => approve(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckOutlined />}
              loading={isProcessing}
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject request"
            description="Reject this registration request?"
            onConfirm={() => reject(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              danger 
              size="small" 
              icon={<CloseOutlined />}
              loading={isProcessing}
            >
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Title level={4}>📝 Registration Requests ({requests.length})</Title>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </>
  );
};
