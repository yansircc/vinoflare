import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "@/server/middleware/procedures";
import type { BaseContext } from "@/server/types/context";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { RedirectssKVStore } from "./helper";
import {
	querySchema,
	redirectsCreateSchema,
	redirectsUpdateSchema,
} from "./types";

const app = new Hono<BaseContext>()
	.basePath("/links")

	// POST /links - 创建短链接（需要认证）
	.post(
		"/",
		authMiddleware,
		zValidator("json", redirectsCreateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const { originalUrl, customCode } = c.req.valid("json");

				const store = new RedirectssKVStore(c.env.KV);
				const newRedirects = await store.createRedirects(
					originalUrl,
					customCode,
					user?.name,
				);

				// 构建完整的短链接URL
				const baseUrl = new URL(c.req.url).origin;
				const shortUrl = `${baseUrl}/s/${newRedirects.shortCode}`;

				return c.json(
					{
						success: true,
						data: {
							...newRedirects,
							shortUrl,
						},
						message: `短链接由 ${user?.name} 成功创建`,
					},
					201,
				);
			} catch (error) {
				console.error("创建短链接失败:", error);
				throw new HTTPException(500, {
					message: error instanceof Error ? error.message : "创建短链接失败",
					cause: error,
				});
			}
		},
	)

	// GET /links - 获取短链接列表（支持分页和排序）
	.get(
		"/",
		optionalAuthMiddleware,
		zValidator("query", querySchema),
		loggingMiddleware,
		async (c) => {
			try {
				const { page, limit, sort } = c.req.valid("query");

				const store = new RedirectssKVStore(c.env.KV);
				const result = await store.getRedirectss(page, limit, sort);

				// 为每个短链接添加完整URL
				const baseUrl = new URL(c.req.url).origin;
				const redirectssWithUrls = result.redirectss.map((link) => ({
					...link,
					shortUrl: `${baseUrl}/s/${link.shortCode}`,
				}));

				return c.json({
					success: true,
					data: redirectssWithUrls,
					pagination: {
						page,
						limit,
						totalCount: result.totalCount,
						totalPages: result.totalPages,
						hasNext: result.hasNext,
						hasPrev: result.hasPrev,
					},
					meta: {
						sort,
						requestedBy: c.get("user")?.name || "anonymous",
					},
				});
			} catch (error) {
				console.error("获取短链接列表失败:", error);
				throw new HTTPException(500, {
					message: "获取短链接列表失败",
					cause: error,
				});
			}
		},
	)

	// GET /links/stats - 获取统计信息
	.get("/stats", optionalAuthMiddleware, loggingMiddleware, async (c) => {
		try {
			const store = new RedirectssKVStore(c.env.KV);
			const stats = await store.getStats();

			return c.json({
				success: true,
				data: stats,
				message: "统计信息获取成功",
			});
		} catch (error) {
			console.error("获取统计信息失败:", error);
			throw new HTTPException(500, {
				message: "获取统计信息失败",
				cause: error,
			});
		}
	})

	// GET /links/:id - 获取特定短链接详情
	.get("/:id", optionalAuthMiddleware, loggingMiddleware, async (c) => {
		try {
			const id = c.req.param("id");

			if (!id) {
				throw new HTTPException(400, {
					message: "无效的短链接ID",
				});
			}

			const store = new RedirectssKVStore(c.env.KV);
			const redirects = await store.getRedirects(id);

			if (!redirects) {
				throw new HTTPException(404, {
					message: "短链接不存在",
				});
			}

			// 添加完整短链接URL
			const baseUrl = new URL(c.req.url).origin;
			const shortUrl = `${baseUrl}/s/${redirects.shortCode}`;

			return c.json({
				success: true,
				data: {
					...redirects,
					shortUrl,
				},
			});
		} catch (error) {
			console.error("获取短链接失败:", error);
			throw new HTTPException(500, {
				message: "获取短链接失败",
				cause: error,
			});
		}
	})

	// PUT /links/:id - 更新短链接（需要认证）
	.put(
		"/:id",
		authMiddleware,
		zValidator("json", redirectsUpdateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const id = c.req.param("id");
				const updates = c.req.valid("json");

				if (!id) {
					throw new HTTPException(400, {
						message: "无效的短链接ID",
					});
				}

				const store = new RedirectssKVStore(c.env.KV);
				const updatedRedirects = await store.updateRedirects(id, updates);

				if (!updatedRedirects) {
					throw new HTTPException(404, {
						message: "短链接不存在",
					});
				}

				// 添加完整短链接URL
				const baseUrl = new URL(c.req.url).origin;
				const shortUrl = `${baseUrl}/s/${updatedRedirects.shortCode}`;

				return c.json({
					success: true,
					data: {
						...updatedRedirects,
						shortUrl,
					},
					message: `短链接由 ${user?.name} 成功更新`,
				});
			} catch (error) {
				console.error("更新短链接失败:", error);
				throw new HTTPException(500, {
					message: "更新短链接失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /links/:id - 删除短链接（需要认证）
	.delete("/:id", authMiddleware, loggingMiddleware, async (c) => {
		try {
			const user = c.get("user");
			const id = c.req.param("id");

			if (!id) {
				throw new HTTPException(400, {
					message: "无效的短链接ID",
				});
			}

			const store = new RedirectssKVStore(c.env.KV);

			// 先获取短链接信息用于返回消息
			const existingRedirects = await store.getRedirects(id);
			if (!existingRedirects) {
				throw new HTTPException(404, {
					message: "短链接不存在",
				});
			}

			const deleted = await store.deleteRedirects(id);
			if (!deleted) {
				throw new HTTPException(500, {
					message: "删除失败",
				});
			}

			return c.json({
				success: true,
				message: `短链接 ${existingRedirects.shortCode} 由 ${user?.name} 成功删除`,
			});
		} catch (error) {
			console.error("删除短链接失败:", error);
			throw new HTTPException(500, {
				message: "删除短链接失败",
				cause: error,
			});
		}
	});

// 创建重定向路由（不在 /links 路径下）
const redirectsApp = new Hono<BaseContext>()
	// GET /s/:shortCode - 短链接重定向
	.get("/s/:shortCode", async (c) => {
		try {
			const shortCode = c.req.param("shortCode");

			if (!shortCode) {
				return c.text("无效的短码", 400);
			}

			const store = new RedirectssKVStore(c.env.KV);
			const originalUrl = await store.visitRedirects(shortCode);

			if (!originalUrl) {
				return c.text("短链接不存在", 404);
			}

			// 302重定向到原始URL
			return c.redirect(originalUrl, 302);
		} catch (error) {
			console.error("重定向失败:", error);
			return c.text("服务器错误", 500);
		}
	});

export const linksRouter = app;
export const redirectsRouter = redirectsApp;
export type LinksRouterType = typeof app;
export type RedirectsRouterType = typeof redirectsApp;
