import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js";
import ordersRouter from "../modules/orders/orders.router.js";
import catalogRouter from "../modules/catalog/catalog.router.js";
import dashboardRouter from "../modules/dashboard/dashboard.router.js";
import profileRouter from "../modules/profile/profile.router.js";
import uploadRouter from "../modules/upload/upload.router.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    name: "互联网院外护理综合服务平台"
  });
});

router.use("/auth", authRouter);
router.use("/orders", ordersRouter);
router.use("/catalog", catalogRouter);
router.use("/dashboard", dashboardRouter);
router.use("/profile", profileRouter);
router.use("/upload", uploadRouter);

export default router;
