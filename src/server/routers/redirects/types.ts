import { z } from "zod";

export const redirectsCreateSchema = z.object({
	originalUrl: z.string().url("请输入有效的URL地址").min(1, "URL不能为空"),
	customCode: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^[a-zA-Z0-9_-]+$/.test(val),
			"自定义代码只能包含字母、数字、下划线和横线",
		)
		.refine(
			(val) => !val || (val.length >= 3 && val.length <= 20),
			"自定义代码长度应在3-20字符之间",
		),
});

export const redirectsUpdateSchema = z.object({
	originalUrl: z.string().url("请输入有效的URL地址").optional(),
});

export const querySchema = z.object({
	page: z.string().default("1").transform(Number),
	limit: z.string().default("10").transform(Number),
	sort: z.enum(["newest", "oldest", "visits"]).default("newest"),
});

// Redirects 类型定义
export interface Redirects {
	id: string;
	shortCode: string;
	originalUrl: string;
	visits: number;
	createdAt: string;
	updatedAt?: string;
	lastVisitedAt?: string;
	createdBy?: string;
}
