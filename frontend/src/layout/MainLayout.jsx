import { useMemo } from "react";
import { Layout, Menu, Avatar, Button, Tag } from "antd";
import {
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  UserOutlined
} from "@ant-design/icons";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../app/session.jsx";

const { Header, Sider, Content } = Layout;

const roleText = {
  PATIENT: "患者端",
  NURSE: "护理端",
  ADMIN: "管理端"
};

export default function MainLayout() {
  const { user, logout } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const items = useMemo(
    () => [
      {
        key: "/",
        icon: <DashboardOutlined />,
        label: <NavLink to="/">工作台</NavLink>
      },
      {
        key: "/orders",
        icon: <FileTextOutlined />,
        label: <NavLink to="/orders">护理工单</NavLink>
      },
      {
        key: "/knowledge",
        icon: <BookOutlined />,
        label: <NavLink to="/knowledge">护理知识</NavLink>
      },
      {
        key: "/profile",
        icon: <UserOutlined />,
        label: <NavLink to="/profile">个人中心</NavLink>
      }
    ],
    []
  );

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0" width={240} theme="light" className="side-panel">
        <div className="brand-box">
          <span>互联网院外护理综合服务平台</span>
        </div>
        <Menu selectedKeys={[location.pathname]} mode="inline" items={items} className="nav-menu" />
      </Sider>
      <Layout>
        <Header className="top-bar">
          <div className="whoami">
            <Avatar size={42} icon={<UserOutlined />} />
            <div>
              <div className="top-name">{user?.name}</div>
              <Tag color="green">{roleText[user?.role]}</Tag>
            </div>
          </div>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            退出登录
          </Button>
        </Header>
        <Content className="main-pane">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
