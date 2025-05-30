import { z } from "zod";

export const postCreateSchema = z.object({
	title: z.string().min(1, "标题不能为空"),
	content: z.string().min(1, "内容不能为空"),
});

export const postUpdateSchema = z.object({
	title: z.string().min(1, "标题不能为空").optional(),
	content: z.string().min(1, "内容不能为空").optional(),
});

export const querySchema = z.object({
	page: z.string().default("1").transform(Number),
	limit: z.string().default("10").transform(Number),
	sort: z.enum(["newest", "oldest"]).default("newest"),
});

// Post 类型定义
export interface Post {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt?: string;
}
