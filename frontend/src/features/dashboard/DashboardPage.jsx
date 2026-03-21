import { useEffect, useState } from "react";
import { Card, Col, List, Row, Skeleton, Statistic, Tag } from "antd";
import dayjs from "dayjs";
import { api } from "../../api/client.js";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cards: [],
    extra: {},
    recentOrders: []
  });

  useEffect(() => {
    let alive = true;
    api
      .get("/dashboard/overview")
      .then(({ data: res }) => {
        if (alive) {
          setData(res);
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div className="page-stack">
      <div className="hero-box">
        <div>
          <div className="hero-title">护理服务运行概览</div>
          <div className="hero-sub">围绕院外护理流程，实时查看工单推进与护理资源状态。</div>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {data.cards.map((item) => (
          <Col xs={24} md={12} xl={6} key={item.label}>
            <Card className="glass-card" bordered={false}>
              <Statistic title={item.label} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="最近工单动态" className="glass-card" bordered={false}>
            <List
              dataSource={data.recentOrders}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.serialNo} · ${item.careType}`}
                    description={`${item.patientName} ｜ ${item.nurseName} ｜ ${dayjs(item.appointAt).format(
                      "MM-DD HH:mm"
                    )}`}
                  />
                  <Tag color={item.stage === "PENDING" ? "gold" : item.stage === "CLOSED" ? "green" : "blue"}>
                    {item.stage === "PENDING"
                      ? "待接单"
                      : item.stage === "RESERVED"
                        ? "已接单"
                        : item.stage === "SERVING"
                          ? "执行中"
                          : item.stage === "FINISHED"
                            ? "待确认"
                            : "已完成"}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="平台侧重点" className="glass-card" bordered={false}>
            <div className="metric-line">
              <span>已完结工单</span>
              <strong>{data.extra.closed}</strong>
            </div>
            <div className="metric-line">
              <span>护理人员总数</span>
              <strong>{data.extra.nurseTotal}</strong>
            </div>
            <div className="metric-line">
              <span>已审核护理人员</span>
              <strong>{data.extra.verifiedNurse}</strong>
            </div>
            <div className="metric-line">
              <span>平台注册用户</span>
              <strong>{data.extra.userTotal}</strong>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
