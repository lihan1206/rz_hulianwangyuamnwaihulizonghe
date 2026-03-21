import { Router } from "express";
import { authGuard, allowRoles } from "../../middleware/auth-guard.js";
import {
  claimOrder,
  createOrder,
  finishOrder,
  listOrders,
  removeOrder,
  reviewOrder,
  startOrder
} from "./orders.service.js";
import { createOrderSchema, finishSchema, reviewSchema } from "./orders.schemas.js";

const router = Router();

router.use(authGuard);

router.get("/", async (req, res) => {
  const list = await listOrders(req.user, {
    tab: req.query.tab,
    stage: req.query.stage
  });
  res.json({ list });
});

router.post("/", allowRoles("PATIENT"), async (req, res) => {
  const dto = createOrderSchema.parse(req.body);
  const detail = await createOrder(req.user, dto);
  res.status(201).json({ detail, message: "护理申请已提交" });
});

router.post("/:id/claim", allowRoles("NURSE"), async (req, res) => {
  const detail = await claimOrder(req.user, req.params.id);
  res.json({ detail, message: "接单成功" });
});

router.post("/:id/start", allowRoles("NURSE"), async (req, res) => {
  const detail = await startOrder(req.user, req.params.id);
  res.json({ detail, message: "服务已开始" });
});

router.post("/:id/finish", allowRoles("NURSE"), async (req, res) => {
  const dto = finishSchema.parse(req.body);
  const detail = await finishOrder(req.user, req.params.id, dto);
  res.json({ detail, message: "服务记录已提交" });
});

router.post("/:id/review", allowRoles("PATIENT"), async (req, res) => {
  const dto = reviewSchema.parse(req.body);
  const detail = await reviewOrder(req.user, req.params.id, dto);
  res.json({ detail, message: "评价已提交" });
});

router.delete("/:id", async (req, res) => {
  await removeOrder(req.user, req.params.id);
  res.json({ message: "工单已删除" });
});

export default router;
