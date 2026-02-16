'use client';

import { Layout, Button, Space, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { logout } from '@/app/actions/auth';
import { HealthIndicator } from '@/widgets/health-indicator/ui/HealthIndicator';
import { APP_NAME } from '@/shared/config/constants';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={3} style={{ margin: 0 }}>{APP_NAME}</Title>
        <Space size="large">
          <HealthIndicator />
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {children}
      </Content>
    </Layout>
  );
}
