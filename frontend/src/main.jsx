import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import AppRoot from "./app/App.jsx";
import { SessionProvider } from "./app/session.jsx";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#1f8a70",
          colorBgLayout: "#f4f8f7",
          borderRadius: 18,
          fontFamily:
            '"HarmonyOS Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif'
        }
      }}
    >
      <AntApp>
        <BrowserRouter>
          <SessionProvider>
            <AppRoot />
          </SessionProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
