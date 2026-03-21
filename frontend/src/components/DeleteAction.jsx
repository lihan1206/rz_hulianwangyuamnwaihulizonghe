import { Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

export default function DeleteAction({ title, description, onConfirm, dangerText = "删除" }) {
  return (
    <Popconfirm
      title={title}
      description={description}
      okText="确认删除"
      cancelText="再想想"
      onConfirm={onConfirm}
      icon={<DeleteOutlined style={{ color: "#d4380d" }} />}
    >
      <Button danger icon={<DeleteOutlined />}>
        {dangerText}
      </Button>
    </Popconfirm>
  );
}
