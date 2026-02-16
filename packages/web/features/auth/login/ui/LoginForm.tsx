'use client';

import { Card, Typography, message, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '@/app/actions/auth';
import { APP_NAME } from '@/shared/config/constants';
import { useActionState } from 'react';

const { Title } = Typography;

export const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      try {
        await login(formData);
        return { error: null };
      } catch (error: any) {
        return { error: error?.message || 'Invalid credentials' };
      }
    },
    { error: null }
  );

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>🔐 {APP_NAME}</Title>
        </div>
        
        <form action={formAction}>
          <div style={{ marginBottom: 16 }}>
            <Input
              name="username"
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Input.Password
              name="password"
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              required
            />
          </div>

          {state?.error && (
            <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
              {state.error}
            </div>
          )}

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isPending}
            size="large"
            block
          >
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );
};
