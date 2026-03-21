import { z } from "zod";

export const createOrderSchema = z.object({
  careType: z.string().min(2, "请选择护理类型"),
  appointAt: z.string().min(1, "请选择预约时间"),
  patientAddr: z.string().min(6, "请输入详细服务地址"),
  needTools: z.string().max(60, "特殊工具说明过长").optional().or(z.literal("")),
  memo: z.string().max(200, "附加说明不能超过 200 字").optional().or(z.literal("")),
  contactName: z.string().min(2, "请输入联系人姓名"),
  contactPhone: z
    .string()
    .regex(/^1\d{10}$/, "请输入正确的联系人手机号")
});

export const finishSchema = z.object({
  serviceNote: z.string().min(8, "请填写服务记录"),
  proofUrl: z.string().optional().or(z.literal(""))
});

export const reviewSchema = z.object({
  score: z.number().int().min(1, "评分至少 1 星").max(5, "评分最多 5 星"),
  comment: z.string().max(120, "评价内容不能超过 120 字").optional().or(z.literal(""))
});
