import { logger } from "../config/logger.js";

export const reqLog = (req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};
