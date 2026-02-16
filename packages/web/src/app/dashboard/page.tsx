'use client';

import { Card } from 'antd';
import { NotificationSender } from '@/widgets/notification-sender/ui/NotificationSender';
import { UsersTable } from '@/widgets/users-table/ui/UsersTable';
import { RegistrationRequestsTable } from '@/widgets/registration-requests-table/ui/RegistrationRequestsTable';

export default function DashboardPage() {
  console.log('Dashboard page rendered');
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <NotificationSender />
        </div>
      </Card>
      
      <Card>
        <UsersTable />
      </Card>
      
      <Card>
        <RegistrationRequestsTable />
      </Card>
    </div>
  );
}
