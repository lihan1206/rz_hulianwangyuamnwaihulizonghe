import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { Router } from "express";
import { authGuard } from "../../middleware/auth-guard.js";
import { env } from "../../config/env.js";

const router = Router();

fs.mkdirSync(env.staticDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.staticDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.floor(Math.random() * 9999)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.use(authGuard);

router.post("/", upload.single("file"), async (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
    message: "图片上传成功"
  });
});

export default router;
