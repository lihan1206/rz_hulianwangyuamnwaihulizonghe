import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string({
      required_error: "请输入手机号"
    })
    .regex(/^1\d{10}$/, "请输入正确的手机号"),
  password: z
    .string({
      required_error: "请输入密码"
    })
    .min(6, "密码不少于 6 位")
});
