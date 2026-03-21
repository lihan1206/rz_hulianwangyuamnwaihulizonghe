import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addDaysAt = (offset, hour, minute) =>
  dayjs().add(offset, "day").hour(hour).minute(minute).second(0).toDate();

const backDaysAt = (offset, hour, minute) =>
  dayjs().subtract(offset, "day").hour(hour).minute(minute).second(0).toDate();

const makeUser = (payload) => payload;
const packArticle = (title, cate, summary, body, recommended) => ({
  title,
  cate,
  summary,
  body,
  recommended
});

const makeFeed = (orderId, stage, note, actorName, actorRole) => ({
  orderId,
  stage,
  note,
  actorName,
  actorRole
});

function appendArticle(list, title, cate, summary, body, recommended) {
  list[list.length] = packArticle(title, cate, summary, body, recommended);
}

async function putFeedIfMissing(payload) {
  const hit = await prisma.orderFeed.findFirst({
    where: {
      orderId: payload.orderId,
      stage: payload.stage,
      note: payload.note
    }
  });

  if (hit?.id) {
    return;
  }

  await prisma.orderFeed.create({
    data: payload
  });
}

async function putReviewIfMissing(orderId, userId, commentText) {
  const reviewed = await prisma.review.findUnique({
    where: { orderId }
  });

  if (reviewed?.id) {
    return;
  }

  await prisma.review.create({
    data: {
      orderId,
      userId,
      score: 5,
      comment: commentText
    }
  });
}

function pickFeedRows(orderId, stageFlag) {
  const feeds = [];
  feeds[feeds.length] = makeFeed(orderId, "PENDING", "患者发起护理申请", "张阿姨", "患者");

  const extraFeedMap = {
    RESERVED: [["RESERVED", "护理人员已接单", "李护士", "护理人员"]],
    CLOSED: [
      ["RESERVED", "护理人员已接单", "李护士", "护理人员"],
      ["FINISHED", "护理服务已完成", "李护士", "护理人员"],
      ["CLOSED", "患者已确认并完成评价", "张阿姨", "患者"]
    ]
  };

  const picked = extraFeedMap[stageFlag] || [];
  for (const unit of picked) {
    feeds[feeds.length] = makeFeed(orderId, unit[0], unit[1], unit[2], unit[3]);
  }

  return feeds;
}

async function saveArticleIfMissing(entry) {
  const hit = await prisma.knowledgeArticle.findFirst({
    where: { title: entry.title }
  });

  if (hit?.id) {
    return;
  }

  await prisma.knowledgeArticle.create({
    data: entry
  });
}

async function seedUsers() {
  const pwd = await bcrypt.hash("123456", 10);

  const baseUsers = [];
  baseUsers.push(
    makeUser({
      phone: "13800000001",
      role: "ADMIN",
      name: "平台管理员",
      city: "上海",
      address: "浦东新区护理中心",
      verified: true
    })
  );
  baseUsers.push(
    makeUser({
      phone: "13800000002",
      role: "PATIENT",
      name: "张阿姨",
      gender: "女",
      city: "上海",
      address: "徐汇区田林路 88 号",
      verified: true
    })
  );
  baseUsers.push(
    makeUser({
      phone: "13800000003",
      role: "NURSE",
      name: "李护士",
      gender: "女",
      city: "上海",
      address: "闵行区漕宝路 210 号",
      specialty: "伤口护理、静脉输液",
      certNo: "HS-2024-1198",
      verified: true
    })
  );
  baseUsers.push(
    makeUser({
      phone: "13800000004",
      role: "NURSE",
      name: "周护理员",
      gender: "男",
      city: "上海",
      address: "长宁区定西路 160 号",
      specialty: "康复指导、术后随访",
      certNo: "HS-2023-0816",
      verified: false
    })
  );

  for (const item of baseUsers) {
    await prisma.user.upsert({
      where: { phone: item.phone },
      update: {
        ...item,
        passwordHash: pwd
      },
      create: {
        ...item,
        passwordHash: pwd
      }
    });
  }
}

async function seedOrders() {
  const patient = await prisma.user.findUniqueOrThrow({
    where: { phone: "13800000002" }
  });
  const nurse = await prisma.user.findUniqueOrThrow({
    where: { phone: "13800000003" }
  });

  const preset = [];
  preset.push({
    serialNo: "HL20260319001",
    careType: "术后换药",
    appointAt: addDaysAt(1, 9, 0),
    patientAddr: "上海市徐汇区田林路 88 号 2 幢 302",
    needTools: "纱布、碘伏",
    memo: "患者高血压，服务前请先测量血压",
    contactName: "张阿姨",
    contactPhone: "13800000002",
    patientId: patient.id,
    stage: "PENDING"
  });
  preset.push({
    serialNo: "HL20260319002",
    careType: "静脉输液",
    appointAt: addDaysAt(2, 14, 30),
    patientAddr: "上海市浦东新区芳甸路 56 弄 9 号",
    needTools: "输液架",
    memo: "上门前需要电话确认到家时间",
    contactName: "张阿姨",
    contactPhone: "13800000002",
    patientId: patient.id,
    nurseId: nurse.id,
    stage: "RESERVED"
  });

  const closedCase = {
    serialNo: "HL20260319003",
    careType: "康复指导",
    appointAt: backDaysAt(1, 11, 0),
    patientAddr: "上海市闵行区莘松路 199 号",
    needTools: "步态训练带",
    memo: "术后第七天，主要看步态与关节活动",
    contactName: "张阿姨",
    contactPhone: "13800000002",
    patientId: patient.id,
    nurseId: nurse.id,
    stage: "CLOSED"
  };
  closedCase.serviceNote = "已完成下肢力量训练、步态纠正与家庭康复建议。";
  closedCase.startedAt = backDaysAt(1, 11, 5);
  closedCase.finishedAt = backDaysAt(1, 11, 52);
  closedCase.closedAt = backDaysAt(1, 15, 0);
  preset.push(closedCase);

  for (const row of preset) {
    const order = await prisma.careOrder.upsert({
      where: { serialNo: row.serialNo },
      update: { ...row },
      create: { ...row }
    });

    const stagedFeeds = pickFeedRows(order.id, row.stage);
    for (const currentFeed of stagedFeeds) {
      await putFeedIfMissing(currentFeed);
    }

    if (row.stage === "CLOSED") {
      const reviewText = ["护理过程细致耐心", "讲解也很清楚。"].join("，");
      await putReviewIfMissing(order.id, patient.id, reviewText);
    }
  }
}

async function seedArticles() {
  const articleList = [];

  appendArticle(
    articleList,
    "术后换药家庭观察要点",
    "术后护理",
    "围绕渗液、红肿、疼痛和换药频次给出家庭观察建议。",
    "术后换药期间，先观察伤口周围是否发红、发热、渗液增多。居家护理要保持伤口干燥，按医嘱更换敷料，若出现持续疼痛、异味或体温升高，应尽快联系医生或平台安排复诊。",
    true
  );
  appendArticle(
    articleList,
    "糖尿病足日常护理清单",
    "慢病护理",
    "从清洁、保暖、鞋袜选择到每日检查的护理清单。",
    "糖尿病足患者需要每日检查足底与趾缝，避免过热水泡脚，鞋袜以宽松透气为主。若发现破溃、水泡或局部麻木加重，应及时就医并记录变化情况。",
    true
  );
  appendArticle(
    articleList,
    "静脉输液上门服务前准备",
    "基础护理",
    "上门输液前先把环境和资料准备好，能减少等待，也方便护理人员开展服务。",
    "上门输液前，家属可先把室内环境整理好，把医嘱、药品和过敏史资料放在手边。照明尽量充足，手臂也要预留平放的位置。若患者近期有发热、寒战或明显不适，最好先联系医护人员确认是否适合当次输液。",
    false
  );

  for (const entry of articleList) {
    await saveArticleIfMissing(entry);
  }
}

async function runSeed() {
  try {
    await seedUsers();
    await seedOrders();
    await seedArticles();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await runSeed();
