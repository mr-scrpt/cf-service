'use client';

import { Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useUsers, type User } from '@/entities/user';
import { useRemoveUser, RemoveButton } from '@/features/remove-user';

const { Title } = Typography;

export const UsersTable = () => {
  const { data: users = [], isLoading } = useUsers();
  const { removeUser, isRemoving, contextHolder } = useRemoveUser();

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 120,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => `@${username}`,
    },
    {
      title: 'Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <RemoveButton
          telegramId={record.telegramId}
          onRemove={removeUser}
          loading={isRemoving}
        />
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Title level={4}>📊 Users ({users.length})</Title>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </>
  );
};
