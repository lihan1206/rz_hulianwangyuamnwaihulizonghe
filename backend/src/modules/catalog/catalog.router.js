import { Router } from "express";
import { db } from "../../lib/prisma.js";
import { authGuard, allowRoles } from "../../middleware/auth-guard.js";
import { articleSchema } from "./catalog.schemas.js";

const router = Router();

router.use(authGuard);

router.get("/knowledge", async (req, res) => {
  const keyword = String(req.query.keyword ?? "").trim();
  const cate = String(req.query.cate ?? "").trim();

  const list = await db.knowledgeArticle.findMany({
    where: {
      ...(keyword
        ? {
            OR: [
              { title: { contains: keyword } },
              { summary: { contains: keyword } },
              { body: { contains: keyword } }
            ]
          }
        : {}),
      ...(cate ? { cate } : {})
    },
    include: {
      collects: {
        where: {
          userId: req.user.id
        }
      }
    },
    orderBy: [{ recommended: "desc" }, { updatedAt: "desc" }]
  });

  res.json({
    list: list.map((item) => ({
      id: item.id,
      title: item.title,
      cate: item.cate,
      summary: item.summary,
      body: item.body,
      recommended: item.recommended,
      collected: item.collects.length > 0,
      createdAt: item.createdAt
    }))
  });
});

router.post("/knowledge", allowRoles("ADMIN"), async (req, res) => {
  const dto = articleSchema.parse(req.body);
  const detail = await db.knowledgeArticle.create({
    data: {
      ...dto,
      recommended: Boolean(dto.recommended)
    }
  });
  res.status(201).json({ detail, message: "知识文章已发布" });
});

router.delete("/knowledge/:id", allowRoles("ADMIN"), async (req, res) => {
  await db.knowledgeArticle.delete({
    where: { id: req.params.id }
  });
  res.json({ message: "知识文章已删除" });
});

router.post("/knowledge/:id/favorite", async (req, res) => {
  await db.collectMark.upsert({
    where: {
      userId_articleId: {
        userId: req.user.id,
        articleId: req.params.id
      }
    },
    update: {},
    create: {
      userId: req.user.id,
      articleId: req.params.id
    }
  });
  res.json({ message: "已加入收藏" });
});

router.delete("/knowledge/:id/favorite", async (req, res) => {
  await db.collectMark.deleteMany({
    where: {
      userId: req.user.id,
      articleId: req.params.id
    }
  });
  res.json({ message: "已取消收藏" });
});

export default router;
