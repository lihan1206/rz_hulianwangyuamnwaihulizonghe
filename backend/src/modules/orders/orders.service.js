import dayjs from "dayjs";
import { db } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";

const stageText = {
  PENDING: "待接单",
  RESERVED: "已接单",
  SERVING: "执行中",
  FINISHED: "待确认",
  CLOSED: "已完成"
};

const feedRow = (orderId, stage, note, actorName, actorRole) =>
  db.orderFeed.create({
    data: {
      orderId,
      stage,
      note,
      actorName,
      actorRole
    }
  });

const withView = (row, currentUser) => ({
  id: row.id,
  serialNo: row.serialNo,
  careType: row.careType,
  appointAt: row.appointAt,
  patientAddr: row.patientAddr,
  needTools: row.needTools,
  memo: row.memo,
  contactName: row.contactName,
  contactPhone: row.contactPhone,
  stage: row.stage,
  stageText: stageText[row.stage],
  serviceNote: row.serviceNote,
  proofUrl: row.proofUrl,
  startedAt: row.startedAt,
  finishedAt: row.finishedAt,
  closedAt: row.closedAt,
  createdAt: row.createdAt,
  patient: row.patient
    ? {
        id: row.patient.id,
        name: row.patient.name,
        phone: row.patient.phone
      }
    : null,
  nurse: row.nurse
    ? {
        id: row.nurse.id,
        name: row.nurse.name,
        phone: row.nurse.phone,
        specialty: row.nurse.specialty,
        verified: row.nurse.verified
      }
    : null,
  review: row.review,
  feeds: row.feeds,
  canClaim: row.stage === "PENDING",
  canStart: row.stage === "RESERVED" && row.nurseId === currentUser.id,
  canFinish: row.stage === "SERVING" && row.nurseId === currentUser.id,
  canReview: row.stage === "FINISHED" && row.patientId === currentUser.id,
  canDelete:
    (row.stage === "PENDING" || row.stage === "CLOSED") &&
    (row.patientId === currentUser.id || currentUser.role === "ADMIN")
});

const pullOne = (id) =>
  db.careOrder.findUnique({
    where: { id },
    include: {
      patient: true,
      nurse: true,
      review: true,
      feeds: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

export const listOrders = async (user, filters) => {
  const where = {};

  if (filters.stage) {
    where.stage = filters.stage;
  }

  if (user.role === "PATIENT") {
    where.patientId = user.id;
  }

  if (user.role === "NURSE") {
    if (filters.tab === "mine") {
      where.nurseId = user.id;
    } else {
      where.OR = [{ stage: "PENDING" }, { nurseId: user.id }];
    }
  }

  const rows = await db.careOrder.findMany({
    where,
    include: {
      patient: true,
      nurse: true,
      review: true,
      feeds: {
        orderBy: {
          createdAt: "desc"
        }
      }
    },
    orderBy: [
      {
        appointAt: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  return rows.map((item) => withView(item, user));
};

export const createOrder = async (user, dto) => {
  const serialNo = `HL${dayjs().format("YYYYMMDDHHmmss")}${String(Math.floor(Math.random() * 90 + 10))}`;
  const row = await db.careOrder.create({
    data: {
      serialNo,
      careType: dto.careType,
      appointAt: new Date(dto.appointAt),
      patientAddr: dto.patientAddr,
      needTools: dto.needTools,
      memo: dto.memo,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      patientId: user.id
    },
    include: {
      patient: true,
      nurse: true,
      review: true,
      feeds: true
    }
  });

  await feedRow(row.id, "PENDING", "患者已提交护理申请", user.name, "患者");
  const full = await pullOne(row.id);
  return withView(full, user);
};

export const claimOrder = async (user, id) => {
  const hit = await pullOne(id);
  if (!hit) {
    throw new HttpError(404, "工单不存在");
  }
  if (!user.verified) {
    throw new HttpError(403, "账号尚未通过资质审核，暂不能接单");
  }
  if (hit.stage !== "PENDING") {
    throw new HttpError(409, "当前工单已被其他护理人员处理");
  }

  await db.careOrder.update({
    where: { id },
    data: {
      stage: "RESERVED",
      nurseId: user.id
    }
  });
  await feedRow(id, "RESERVED", "护理人员已成功接单", user.name, "护理人员");
  const row = await pullOne(id);
  return withView(row, user);
};

export const startOrder = async (user, id) => {
  const hit = await pullOne(id);
  if (!hit) {
    throw new HttpError(404, "工单不存在");
  }
  if (hit.nurseId !== user.id || hit.stage !== "RESERVED") {
    throw new HttpError(409, "当前工单状态不允许开始服务");
  }

  await db.careOrder.update({
    where: { id },
    data: {
      stage: "SERVING",
      startedAt: new Date()
    }
  });
  await feedRow(id, "SERVING", "护理服务已开始执行", user.name, "护理人员");
  const row = await pullOne(id);
  return withView(row, user);
};

export const finishOrder = async (user, id, dto) => {
  const hit = await pullOne(id);
  if (!hit) {
    throw new HttpError(404, "工单不存在");
  }
  if (hit.nurseId !== user.id || hit.stage !== "SERVING") {
    throw new HttpError(409, "请先开始服务后再提交完成记录");
  }

  await db.careOrder.update({
    where: { id },
    data: {
      stage: "FINISHED",
      serviceNote: dto.serviceNote,
      proofUrl: dto.proofUrl || null,
      finishedAt: new Date()
    }
  });
  await feedRow(id, "FINISHED", "护理人员已提交服务记录", user.name, "护理人员");
  const row = await pullOne(id);
  return withView(row, user);
};

export const reviewOrder = async (user, id, dto) => {
  const hit = await pullOne(id);
  if (!hit) {
    throw new HttpError(404, "工单不存在");
  }
  if (hit.patientId !== user.id || hit.stage !== "FINISHED") {
    throw new HttpError(409, "当前工单还不能评价");
  }
  if (hit.review) {
    throw new HttpError(409, "该工单已评价");
  }

  await db.review.create({
    data: {
      orderId: id,
      userId: user.id,
      score: dto.score,
      comment: dto.comment
    }
  });

  await db.careOrder.update({
    where: { id },
    data: {
      stage: "CLOSED",
      closedAt: new Date()
    }
  });

  await feedRow(id, "CLOSED", "患者已确认服务并提交评价", user.name, "患者");
  const row = await pullOne(id);
  return withView(row, user);
};

export const removeOrder = async (user, id) => {
  const hit = await pullOne(id);
  if (!hit) {
    throw new HttpError(404, "工单不存在");
  }

  const isOwner = hit.patientId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, "只有发单人或管理员可以删除工单");
  }
  if (!["PENDING", "CLOSED"].includes(hit.stage)) {
    throw new HttpError(409, "仅待接单或已完成工单可删除");
  }

  await db.careOrder.delete({
    where: { id }
  });
};
