# 互联网院外护理综合服务平台

## 🛠 技术栈
- Frontend: React 19 + Vite + Ant Design
- Backend: Node.js + Express + Prisma
- Database: MySQL 8

## 🚀 启动指南
1. 确保 Docker Desktop 已启动。
2. 在项目根目录执行：`docker compose up --build`
3. 首次启动会自动初始化数据库并写入演示数据。

## 📦 打包说明
在项目根目录执行：`./scripts/package_release.sh`

该脚本不会执行自动测试，并会自动排除 `node_modules`、`venv`、`target`、`.git`、`frontend/dist`、`backend/uploads`、Python 文件、测试用例、测试脚本及自动化测试文件，生成轻量发布包到 `release/` 目录。

## 🔗 服务地址
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/health
- Database: localhost:3306（user: care_user / pass: care_pass）

## 🧪 测试账号
- 管理员：13800000001 / 123456
- 患者：13800000002 / 123456
- 护理人员：13800000003 / 123456
