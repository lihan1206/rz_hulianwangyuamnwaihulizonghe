import { db } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { readToken } from "../lib/token.js";

const pullBearer = (header) => {
  if (!header?.startsWith("Bearer ")) {
    return "";
  }
  return header.slice(7);
};

export const authGuard = async (req, _res, next) => {
  const token = pullBearer(req.headers.authorization);
  if (!token) {
    next(new HttpError(401, "请先登录后再继续"));
    return;
  }

  try {
    const data = readToken(token);
    const user = await db.user.findUnique({ where: { id: data.uid } });
    if (!user || !user.id) {
      next(new HttpError(401, "登录状态已失效"));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, "登录凭证无效，请重新登录"));
  }
};

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(new HttpError(403, "当前账号没有此操作权限"));
    return;
  }
  next();
};
