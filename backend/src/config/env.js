import path from "node:path";

const must = (key, fallback = "") => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`缺少环境变量: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: must("JWT_SECRET", "waihuli-secret"),
  databaseUrl: must(
    "DATABASE_URL",
    "mysql://care_user:care_pass@db:3306/waihuli?charset=utf8mb4"
  ),
  staticDir: process.env.STATIC_DIR ?? path.resolve(process.cwd(), "uploads")
};
