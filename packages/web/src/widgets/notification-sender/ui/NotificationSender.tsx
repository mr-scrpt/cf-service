'use client';

import { Button, Modal, Form, Input } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotificationSender } from '../model/useNotificationSender';
import type { NotificationPayload } from '@/shared/api/types';

export const NotificationSender = () => {
  const { isModalOpen, openModal, closeModal, sendNotification, isSending, contextHolder } = useNotificationSender();
  const [form] = Form.useForm();

  const handleSubmit = (values: NotificationPayload) => {
    sendNotification(values);
    form.resetFields();
  };

  return (
    <>
      {contextHolder}
      <Button 
        type="primary" 
        icon={<BellOutlined />} 
        onClick={openModal}
        size="large"
      >
        Send Test Notification
      </Button>

      <Modal
        title="🔔 Send Test Notification"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            event: 'test',
            status: 'success',
            message: 'Test notification from admin panel',
            version: '1.0.0',
          }}
        >
          <Form.Item
            label="Event"
            name="event"
            rules={[{ required: true, message: 'Please input event name' }]}
          >
            <Input placeholder="deployment, alert, test, etc." />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
          >
            <Input placeholder="success, error, warning, info" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: 'Please input message' }]}
          >
            <Input.TextArea rows={4} placeholder="Your notification message..." />
          </Form.Item>

          <Form.Item
            label="Version"
            name="version"
          >
            <Input placeholder="1.0.0" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isSending} block>
              Send Notification
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
