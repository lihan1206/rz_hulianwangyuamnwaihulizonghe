import { Router } from "express";
import { db } from "../../lib/prisma.js";
import { verifyPwd } from "../../lib/password.js";
import { pickUser } from "../../lib/pick-user.js";
import { signToken } from "../../lib/token.js";
import { HttpError } from "../../lib/http-error.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { loginSchema } from "./auth.schemas.js";

const router = Router();

router.post("/login", async (req, res) => {
  const dto = loginSchema.parse(req.body);
  const user = await db.user.findUnique({
    where: { phone: dto.phone }
  });

  if (!user) {
    throw new HttpError(401, "手机号或密码不正确");
  }

  const ok = await verifyPwd(dto.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "手机号或密码不正确");
  }

  res.json({
    token: signToken({
      uid: user.id,
      role: user.role
    }),
    user: pickUser(user)
  });
});

router.get("/me", authGuard, async (req, res) => {
  res.json({
    user: pickUser(req.user)
  });
});

export default router;
