import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface RemoveButtonProps {
  telegramId: number;
  onRemove: (telegramId: number) => void;
  loading?: boolean;
}

export const RemoveButton = ({ telegramId, onRemove, loading }: RemoveButtonProps) => {
  return (
    <Popconfirm
      title="Remove user"
      description="Are you sure you want to remove this user?"
      onConfirm={() => onRemove(telegramId)}
      okText="Yes"
      cancelText="No"
    >
      <Button 
        danger 
        size="small" 
        icon={<DeleteOutlined />}
        loading={loading}
      >
        Remove
      </Button>
    </Popconfirm>
  );
};
