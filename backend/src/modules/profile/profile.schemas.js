import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "姓名至少 2 个字"),
  gender: z.string().max(10).optional().or(z.literal("")),
  city: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(120).optional().or(z.literal("")),
  specialty: z.string().max(80).optional().or(z.literal("")),
  certNo: z.string().max(40).optional().or(z.literal(""))
});
