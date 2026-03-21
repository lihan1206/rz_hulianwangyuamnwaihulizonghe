import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  List,
  Rate,
  Row,
  Select,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Upload,
  message
} from "antd";
import {
  CheckCircleOutlined,
  CloudUploadOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  StarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { z } from "zod";
import { api, apiBase, assetUrl } from "../../api/client.js";
import { useSession } from "../../app/session.jsx";
import DeleteAction from "../../components/DeleteAction.jsx";

const careOptions = ["术后换药", "静脉输液", "伤口护理", "康复指导", "导管护理"];

const createSchema = z.object({
  careType: z.string().min(2),
  appointAt: z.string().min(1),
  patientAddr: z.string().min(6),
  needTools: z.string().optional(),
  memo: z.string().optional(),
  contactName: z.string().min(2),
  contactPhone: z.string().regex(/^1\d{10}$/)
});

const finishSchema = z.object({
  serviceNote: z.string().min(8, "服务记录不能过短"),
  proofUrl: z.string().optional()
});

const stageColorMap = {
  CLOSED: "green",
  PENDING: "gold"
};

const getStageColor = (stage) => stageColorMap[stage] || "blue";

export default function OrderCenterPage() {
  const { user, token } = useSession();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState(user?.role === "NURSE" ? "hall" : "all");
  const [form] = Form.useForm();
  const [doneForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const openDone = (item) => {
    setCurrent(item);
    setDoneOpen(true);
  };

  const openReview = (item) => {
    setCurrent(item);
    setReviewOpen(true);
  };

  const canRemove = (item) =>
    (user?.role === "PATIENT" && ["PENDING", "CLOSED"].includes(item.stage)) || user?.role === "ADMIN";

  const drawTimeLine = (item) =>
    item.feeds.map((feed) => ({
      children: `${feed.note} · ${dayjs(feed.createdAt).format("MM-DD HH:mm")}`
    }));

  const drawOps = (item) => {
    const ops = [];

    if (item.canClaim && user?.role === "NURSE") {
      ops.push(
        <Button key="claim" type="primary" onClick={() => actOrder(`/orders/${item.id}/claim`, "接单成功")}>
          接单
        </Button>
      );
    }

    if (item.canStart && user?.role === "NURSE") {
      ops.push(
        <Button key="start" icon={<PlayCircleOutlined />} onClick={() => actOrder(`/orders/${item.id}/start`, "服务已开始")}>
          开始服务
        </Button>
      );
    }

    if (item.canFinish && user?.role === "NURSE") {
      ops.push(
        <Button key="finish" icon={<CheckCircleOutlined />} onClick={() => openDone(item)}>
          提交完成记录
        </Button>
      );
    }

    if (item.canReview && user?.role === "PATIENT") {
      ops.push(
        <Button key="review" type="primary" icon={<StarOutlined />} onClick={() => openReview(item)}>
          确认并评价
        </Button>
      );
    }

    if (canRemove(item)) {
      ops.push(
        <DeleteAction
          key="delete"
          title="确认删除这条工单吗？"
          description="删除后将同步移除服务记录和流程轨迹，请谨慎操作。"
          onConfirm={() => deleteOrder(item.id)}
        />
      );
    }

    return ops;
  };

  const loadOrders = async (nextTab = tab) => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: user?.role === "NURSE" ? { tab: nextTab } : {}
      });
      setOrders(data.list);
    } catch (error) {
      message.error(error.response?.data?.message ?? "工单读取失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(tab);
  }, [tab]);

  const tabItems = useMemo(() => {
    if (user?.role === "NURSE") {
      return [
        { key: "hall", label: "可接工单" },
        { key: "mine", label: "我的服务" }
      ];
    }
    return [{ key: "all", label: user?.role === "ADMIN" ? "平台工单" : "我的工单" }];
  }, [user?.role]);

  const submitCreate = async (values) => {
    const parsed = createSchema.safeParse({
      ...values,
      appointAt: values.appointAt
    });
    if (!parsed.success) {
      message.error("请完整填写护理申请信息");
      return;
    }

    try {
      await api.post("/orders", parsed.data);
      message.success("护理申请已提交");
      form.resetFields();
      setDrawerOpen(false);
      loadOrders();
    } catch (error) {
      message.error(error.response?.data?.message ?? "提交失败");
    }
  };

  const actOrder = async (url, text) => {
    try {
      await api.post(url);
      message.success(text);
      loadOrders();
    } catch (error) {
      message.error(error.response?.data?.message ?? "操作失败");
    }
  };

  const submitFinish = async () => {
    const values = await doneForm.validateFields();
    const parsed = finishSchema.safeParse(values);
    if (!parsed.success) {
      message.error(parsed.error.issues[0]?.message ?? "请完善服务记录");
      return;
    }

    try {
      await api.post(`/orders/${current.id}/finish`, parsed.data);
      message.success("服务记录已提交");
      setDoneOpen(false);
      doneForm.resetFields();
      loadOrders();
    } catch (error) {
      message.error(error.response?.data?.message ?? "提交失败");
    }
  };

  const submitReview = async () => {
    const values = await reviewForm.validateFields();
    try {
      await api.post(`/orders/${current.id}/review`, values);
      message.success("评价已提交");
      setReviewOpen(false);
      reviewForm.resetFields();
      loadOrders();
    } catch (error) {
      message.error(error.response?.data?.message ?? "评价提交失败");
    }
  };

  const deleteOrder = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      message.success("工单已删除");
      loadOrders();
    } catch (error) {
      message.error(error.response?.data?.message ?? "删除失败");
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <Space wrap>
          {tabItems.map((item) => (
            <Button
              key={item.key}
              type={tab === item.key ? "primary" : "default"}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </Space>
        {user?.role === "PATIENT" && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            发布护理申请
          </Button>
        )}
      </div>

      {orders.length === 0 ? (
        <Card className="glass-card" bordered={false}>
          <Empty description="当前还没有符合条件的工单" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {orders.map((item) => (
            <Col xs={24} xl={12} key={item.id}>
              <Card
                className="glass-card order-card"
                bordered={false}
                title={
                  <Space wrap>
                    <span>{item.careType}</span>
                    <Tag color={getStageColor(item.stage)}>{item.stageText}</Tag>
                  </Space>
                }
                extra={item.serialNo}
              >
                <div className="order-grid">
                  <div>预约时间：{dayjs(item.appointAt).format("YYYY-MM-DD HH:mm")}</div>
                  <div>联系人：{item.contactName}</div>
                  <div>联系电话：{item.contactPhone}</div>
                  <div>服务地址：{item.patientAddr}</div>
                  <div>特殊工具：{item.needTools || "无"}</div>
                  <div>附加说明：{item.memo || "无"}</div>
                  <div>患者姓名：{item.patient?.name || "--"}</div>
                  <div>护理人员：{item.nurse?.name || "待分配"}</div>
                </div>

                {item.serviceNote && (
                  <Card className="inner-card" size="small" title="服务记录">
                    <p>{item.serviceNote}</p>
                    {item.proofUrl ? (
                      <Image width={180} src={assetUrl(item.proofUrl)} alt="服务凭证" />
                    ) : null}
                  </Card>
                )}

                {item.review ? (
                  <Card className="inner-card" size="small" title="服务评价">
                    <Rate disabled value={item.review.score} />
                    <p>{item.review.comment || "本次未填写文字评价"}</p>
                  </Card>
                ) : null}

                <Timeline className="feed-timeline" items={drawTimeLine(item)} />

                <Space wrap>{drawOps(item)}</Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        title="发布护理申请"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        <Form form={form} layout="vertical" onFinish={submitCreate}>
          <Form.Item name="careType" label="护理类型" rules={[{ required: true, message: "请选择护理类型" }]}>
            <Select options={careOptions.map((item) => ({ value: item, label: item }))} />
          </Form.Item>
          <Form.Item name="appointAt" label="预约时间" rules={[{ required: true, message: "请选择预约时间" }]}>
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item name="patientAddr" label="服务地址" rules={[{ required: true, message: "请输入服务地址" }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="contactName" label="联系人姓名" rules={[{ required: true, message: "请输入联系人姓名" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contactPhone" label="联系人手机号" rules={[{ required: true, message: "请输入联系人手机号" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="needTools" label="特殊工具">
            <Input placeholder="如：输液架、血糖仪" />
          </Form.Item>
          <Form.Item name="memo" label="附加说明">
            <Input.TextArea rows={4} placeholder="如患者基础疾病、注意事项等" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            提交申请
          </Button>
        </Form>
      </Drawer>

      <Drawer
        title="提交服务完成记录"
        open={doneOpen}
        onClose={() => setDoneOpen(false)}
        width={520}
      >
        <Form form={doneForm} layout="vertical">
          <Form.Item
            name="serviceNote"
            label="服务记录"
            rules={[{ required: true, message: "请填写服务记录" }]}
          >
            <Input.TextArea rows={5} placeholder="请记录护理过程、观察结果与后续建议" />
          </Form.Item>
          <Form.Item name="proofUrl" label="服务凭证图片">
            <Upload
              name="file"
              action={`${apiBase}/upload`}
              headers={{ Authorization: `Bearer ${token}` }}
              listType="picture-card"
              maxCount={1}
              onChange={({ file }) => {
                if (file.status === "done") {
                  doneForm.setFieldValue("proofUrl", file.response.url);
                  message.success("服务凭证上传成功");
                }
                if (file.status === "error") {
                  message.error("图片上传失败");
                }
              }}
            >
              <button type="button" className="upload-btn">
                <CloudUploadOutlined />
                <div>上传图片</div>
              </button>
            </Upload>
          </Form.Item>
          <Button type="primary" block onClick={submitFinish}>
            提交完成记录
          </Button>
        </Form>
      </Drawer>

      <Drawer title="确认服务并评价" open={reviewOpen} onClose={() => setReviewOpen(false)} width={480}>
        <Form form={reviewForm} layout="vertical" initialValues={{ score: 5 }}>
          <Form.Item name="score" label="满意度评分" rules={[{ required: true, message: "请选择评分" }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="comment" label="服务评价">
            <Input.TextArea rows={4} placeholder="欢迎填写护理体验与建议" />
          </Form.Item>
          <Button type="primary" block onClick={submitReview}>
            提交评价
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
