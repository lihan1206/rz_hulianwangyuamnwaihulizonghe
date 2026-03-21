import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: err.issues[0]?.message ?? "提交参数不合法"
    });
    return;
  }

  const code = err.status ?? 500;
  if (code >= 500) {
    logger.error(err);
  }

  res.status(code).json({
    message: err.message ?? "服务暂时不可用，请稍后再试"
  });
};
