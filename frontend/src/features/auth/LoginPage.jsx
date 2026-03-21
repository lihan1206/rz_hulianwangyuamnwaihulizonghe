import { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../../api/client.js";
import { useSession } from "../../app/session.jsx";

const formSchema = z.object({
  phone: z.string().regex(/^1\d{10}$/, "请输入正确的手机号"),
  password: z.string().min(6, "密码不少于 6 位")
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message ?? "请完善登录信息");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", parsed.data);
      login(data.token, data.user);
      message.success("登录成功");
      navigate("/", { replace: true });
    } catch (error) {
      message.error(error.response?.data?.message ?? "登录失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow login-glow-a" />
      <div className="login-glow login-glow-b" />
      <Card className="login-card" bordered={false}>
        <h1 className="login-title">互联网院外护理综合服务平台</h1>
        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item label="手机号" name="phone" rules={[{ required: true, message: "请输入手机号" }]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录进入
          </Button>
        </Form>
      </Card>
    </div>
  );
}
