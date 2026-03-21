import { Router } from "express";
import { db } from "../../lib/prisma.js";
import { pickUser } from "../../lib/pick-user.js";
import { authGuard, allowRoles } from "../../middleware/auth-guard.js";
import { updateProfileSchema } from "./profile.schemas.js";

const router = Router();

router.use(authGuard);

router.get("/me", async (req, res) => {
  const user = await db.user.findUniqueOrThrow({
    where: { id: req.user.id }
  });
  res.json({
    detail: pickUser(user)
  });
});

router.patch("/me", async (req, res) => {
  const dto = updateProfileSchema.parse(req.body);
  const user = await db.user.update({
    where: { id: req.user.id },
    data: dto
  });
  res.json({
    detail: pickUser(user),
    message: "资料已更新"
  });
});

router.get("/users", allowRoles("ADMIN"), async (_req, res) => {
  const list = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }]
  });
  res.json({
    list: list.map(pickUser)
  });
});

router.post("/users/:id/verify", allowRoles("ADMIN"), async (req, res) => {
  const detail = await db.user.update({
    where: { id: req.params.id },
    data: {
      verified: true
    }
  });
  res.json({
    detail: pickUser(detail),
    message: "资质审核已通过"
  });
});

export default router;
