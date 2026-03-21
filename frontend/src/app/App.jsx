import { Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary.jsx";
import GuardRoute from "../components/GuardRoute.jsx";
import MainLayout from "../layout/MainLayout.jsx";
import LoginPage from "../features/auth/LoginPage.jsx";
import DashboardPage from "../features/dashboard/DashboardPage.jsx";
import OrderCenterPage from "../features/orders/OrderCenterPage.jsx";
import KnowledgePage from "../features/knowledge/KnowledgePage.jsx";
import ProfilePage from "../features/profile/ProfilePage.jsx";

export default function AppRoot() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <GuardRoute>
              <MainLayout />
            </GuardRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrderCenterPage />} />
          <Route path="knowledge" element={<KnowledgePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
