import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import { useSession } from "../app/session.jsx";

export default function GuardRoute({ children }) {
  const { token, booting } = useSession();
  const location = useLocation();

  if (booting) {
    return (
      <div className="center-pane">
        <Spin size="large" tip="正在同步登录状态" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
