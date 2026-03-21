import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Drawer,
  Empty,
  Form,
  Input,
  Row,
  Col,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
  Typography,
  message
} from "antd";
import { BookOutlined, HeartFilled, HeartOutlined, PlusOutlined } from "@ant-design/icons";
import { z } from "zod";
import { api } from "../../api/client.js";
import { useSession } from "../../app/session.jsx";
import DeleteAction from "../../components/DeleteAction.jsx";

const articleSchema = z.object({
  title: z.string().min(4),
  cate: z.string().min(2),
  summary: z.string().min(8),
  body: z.string().min(20),
  recommended: z.boolean().optional()
});

const cateList = ["术后护理", "慢病护理", "基础护理"];

export default function KnowledgePage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [cate, setCate] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const loadArticles = async (nextKeyword = keyword, nextCate = cate) => {
    setLoading(true);
    try {
      const { data } = await api.get("/catalog/knowledge", {
        params: {
          keyword: nextKeyword,
          cate: nextCate
        }
      });
      setArticles(data.list);
    } catch (error) {
      message.error(error.response?.data?.message ?? "知识库读取失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const toggleFavorite = async (item) => {
    try {
      if (item.collected) {
        await api.delete(`/catalog/knowledge/${item.id}/favorite`);
        message.success("已取消收藏");
      } else {
        await api.post(`/catalog/knowledge/${item.id}/favorite`);
        message.success("已加入收藏");
      }
      loadArticles();
    } catch (error) {
      message.error(error.response?.data?.message ?? "操作失败");
    }
  };

  const createArticle = async (values) => {
    const parsed = articleSchema.safeParse(values);
    if (!parsed.success) {
      message.error("请完善知识文章信息");
      return;
    }
    try {
      await api.post("/catalog/knowledge", parsed.data);
      message.success("知识文章已发布");
      setDrawerOpen(false);
      form.resetFields();
      loadArticles();
    } catch (error) {
      message.error(error.response?.data?.message ?? "发布失败");
    }
  };

  const deleteArticle = async (id) => {
    try {
      await api.delete(`/catalog/knowledge/${id}`);
      message.success("知识文章已删除");
      loadArticles();
    } catch (error) {
      message.error(error.response?.data?.message ?? "删除失败");
    }
  };

  return (
    <div className="page-stack">
      <div className="toolbar">
        <Space wrap>
          <Input.Search
            placeholder="搜索护理知识"
            allowClear
            onSearch={(value) => {
              setKeyword(value);
              loadArticles(value, cate);
            }}
            style={{ width: 260 }}
          />
          <Select
            placeholder="筛选分类"
            allowClear
            value={cate || undefined}
            style={{ width: 160 }}
            options={cateList.map((item) => ({ value: item, label: item }))}
            onChange={(value) => {
              const next = value || "";
              setCate(next);
              loadArticles(keyword, next);
            }}
          />
        </Space>
        {user?.role === "ADMIN" && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            新增知识
          </Button>
        )}
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : articles.length === 0 ? (
        <Card className="glass-card" bordered={false}>
          <Empty description="没有找到匹配的护理知识" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {articles.map((item) => (
            <Col xs={24} lg={12} key={item.id}>
              <Card
                className="glass-card"
                bordered={false}
                title={
                  <Space wrap>
                    <BookOutlined />
                    <span>{item.title}</span>
                    {item.recommended ? <Tag color="green">推荐</Tag> : null}
                  </Space>
                }
                extra={<Tag>{item.cate}</Tag>}
              >
                <Typography.Paragraph>{item.summary}</Typography.Paragraph>
                <Typography.Paragraph type="secondary">{item.body}</Typography.Paragraph>
                <Space wrap>
                  <Button
                    icon={item.collected ? <HeartFilled /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(item)}
                  >
                    {item.collected ? "已收藏" : "收藏"}
                  </Button>
                  {user?.role === "ADMIN" ? (
                    <DeleteAction
                      title="确认删除这篇知识文章吗？"
                      description="删除后文章将无法再被检索和收藏。"
                      onConfirm={() => deleteArticle(item.id)}
                    />
                  ) : null}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Drawer title="发布护理知识" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}>
        <Form form={form} layout="vertical" onFinish={createArticle}>
          <Form.Item label="文章标题" name="title" rules={[{ required: true, message: "请输入标题" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="文章分类" name="cate" rules={[{ required: true, message: "请输入分类" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="文章摘要" name="summary" rules={[{ required: true, message: "请输入摘要" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="正文内容" name="body" rules={[{ required: true, message: "请输入正文" }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="设为推荐" name="recommended" valuePropName="checked">
            <Switch checkedChildren="推荐" unCheckedChildren="普通" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            发布文章
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
