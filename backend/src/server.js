import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

app.listen(env.port, () => {
  logger.info(`服务已启动，监听端口 ${env.port}`);
});
