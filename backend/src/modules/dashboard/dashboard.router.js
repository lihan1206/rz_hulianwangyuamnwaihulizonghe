import { Router } from "express";
import dayjs from "dayjs";
import { authGuard } from "../../middleware/auth-guard.js";
import { db } from "../../lib/prisma.js";

const router = Router();

router.use(authGuard);

router.get("/overview", async (req, res) => {
  const commonWhere =
    req.user.role === "PATIENT"
      ? { patientId: req.user.id }
      : req.user.role === "NURSE"
        ? { OR: [{ nurseId: req.user.id }, { stage: "PENDING" }] }
        : {};

  const [total, pending, closed, reviews, recentOrders, nurses, users] = await Promise.all([
    db.careOrder.count({ where: commonWhere }),
    db.careOrder.count({
      where: {
        ...commonWhere,
        stage: "PENDING"
      }
    }),
    db.careOrder.count({
      where: {
        ...commonWhere,
        stage: "CLOSED"
      }
    }),
    db.review.findMany(),
    db.careOrder.findMany({
      where: commonWhere,
      include: {
        patient: true,
        nurse: true
      },
      take: 5,
      orderBy: {
        updatedAt: "desc"
      }
    }),
    db.user.findMany({
      where: {
        role: "NURSE"
      }
    }),
    db.user.count()
  ]);

  const scoreAvg = reviews.length
    ? (reviews.reduce((sum, item) => sum + item.score, 0) / reviews.length).toFixed(1)
    : "5.0";

  const todayCount = await db.careOrder.count({
    where: {
      createdAt: {
        gte: dayjs().startOf("day").toDate(),
        lte: dayjs().endOf("day").toDate()
      }
    }
  });

  const nurseDone = nurses.map((item) => ({
    name: item.name,
    verified: item.verified
  }));

  res.json({
    cards: [
      { label: "工单总量", value: total },
      { label: "待处理工单", value: pending },
      { label: "今日新增", value: todayCount },
      { label: "满意度", value: `${scoreAvg} 分` }
    ],
    extra: {
      closed,
      nurseTotal: nurses.length,
      verifiedNurse: nurseDone.filter((item) => item.verified).length,
      userTotal: users
    },
    recentOrders: recentOrders.map((item) => ({
      id: item.id,
      serialNo: item.serialNo,
      careType: item.careType,
      stage: item.stage,
      appointAt: item.appointAt,
      patientName: item.patient.name,
      nurseName: item.nurse?.name ?? "待分配"
    }))
  });
});

export default router;
