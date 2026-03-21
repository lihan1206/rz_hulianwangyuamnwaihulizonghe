import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Row,
  Skeleton,
  Space,
  Tag,
  message
} from "antd";
import { api } from "../../api/client.js";
import { useSession } from "../../app/session.jsx";

export default function ProfilePage() {
  const { user, setUser } = useSession();
  const [loading, setLoading] = useState(true);
  const [memberList, setMemberList] = useState([]);
  const [form] = Form.useForm();

  const pullProfile = async () => {
    setLoading(true);
    try {
      const [{ data }, usersRes] = await Promise.all([
        api.get("/profile/me"),
        user?.role === "ADMIN" ? api.get("/profile/users") : Promise.resolve({ data: { list: [] } })
      ]);
      form.setFieldsValue(data.detail);
      if (user?.role === "ADMIN") {
        setMemberList(usersRes.data.list);
      }
    } catch (error) {
      message.error(error.response?.data?.message ?? "资料读取失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pullProfile();
  }, []);

  const saveProfile = async (values) => {
    try {
      const { data } = await api.patch("/profile/me", values);
      setUser(data.detail);
      localStorage.setItem("waihuli_user", JSON.stringify(data.detail));
      message.success("资料已更新");
    } catch (error) {
      message.error(error.response?.data?.message ?? "保存失败");
    }
  };

  const passVerify = async (id) => {
    try {
      await api.post(`/profile/users/${id}/verify`);
      message.success("护士资质已审核通过");
      pullProfile();
    } catch (error) {
      message.error(error.response?.data?.message ?? "审核失败");
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div className="page-stack">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="个人资料" className="glass-card" bordered={false}>
            <Form form={form} layout="vertical" onFinish={saveProfile}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: "请输入姓名" }]}>
                <Input />
              </Form.Item>
              <Form.Item name="gender" label="性别">
                <Input />
              </Form.Item>
              <Form.Item name="city" label="所在城市">
                <Input />
              </Form.Item>
              <Form.Item name="address" label="联系地址">
                <Input.TextArea rows={3} />
              </Form.Item>
              {user?.role === "NURSE" ? (
                <>
                  <Form.Item name="specialty" label="护理专长">
                    <Input />
                  </Form.Item>
                  <Form.Item name="certNo" label="资质编号">
                    <Input />
                  </Form.Item>
                </>
              ) : null}
              <Button type="primary" htmlType="submit" block>
                保存资料
              </Button>
            </Form>
          </Card>
        </Col>

        {user?.role === "ADMIN" ? (
          <Col xs={24} lg={12}>
            <Card title="用户管理" className="glass-card" bordered={false}>
              <List
                dataSource={memberList}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      item.role === "NURSE" && !item.verified ? (
                        <Button type="link" onClick={() => passVerify(item.id)}>
                          通过审核
                        </Button>
                      ) : null
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space wrap>
                          <span>{item.name}</span>
                          <Tag>{item.role === "ADMIN" ? "管理员" : item.role === "NURSE" ? "护理人员" : "患者"}</Tag>
                          {item.verified ? <Tag color="green">已审核</Tag> : <Tag color="gold">待审核</Tag>}
                        </Space>
                      }
                      description={`${item.phone} ｜ ${item.city || "未填写城市"} ｜ ${item.address || "未填写地址"}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        ) : null}
      </Row>
    </div>
  );
}
