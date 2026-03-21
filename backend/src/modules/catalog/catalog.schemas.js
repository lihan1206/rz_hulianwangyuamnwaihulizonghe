import { z } from "zod";

export const articleSchema = z.object({
  title: z.string().min(4, "请输入文章标题"),
  cate: z.string().min(2, "请输入分类名称"),
  summary: z.string().min(8, "请输入文章摘要"),
  body: z.string().min(20, "文章正文不能过短"),
  recommended: z.boolean().optional()
});
