import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "@/server/middleware/procedures";
import type { BaseContext } from "@/server/types/context";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { PostsKVStore } from "./helper";
import { postCreateSchema, postUpdateSchema, querySchema } from "./types";

const app = new Hono<BaseContext>()
	.post(
		"/posts",
		authMiddleware,
		zValidator("json", postCreateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const { title, content } = c.req.valid("json");

				const store = new PostsKVStore(c.env.KV);
				const newPost = await store.createPost(title, content);

				return c.json(
					{
						success: true,
						data: newPost,
						message: `文章《${newPost.title}》由 ${user?.name} 成功创建`,
					},
					201,
				);
			} catch (error) {
				console.error("创建文章失败:", error);
				throw new HTTPException(500, {
					message: "创建文章失败",
					cause: error,
				});
			}
		},
	)

	// GET /posts - 获取文章列表（支持分页和排序）
	.get(
		"/posts",
		optionalAuthMiddleware,
		zValidator("query", querySchema),
		loggingMiddleware,
		async (c) => {
			try {
				const { page, limit, sort } = c.req.valid("query");

				const store = new PostsKVStore(c.env.KV);
				const result = await store.getPosts(page, limit, sort);

				return c.json({
					success: true,
					data: result.posts,
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
				console.error("获取文章列表失败:", error);
				throw new HTTPException(500, {
					message: "获取文章列表失败",
					cause: error,
				});
			}
		},
	)

	// GET /posts/latest - 获取最新文章
	.get(
		"/posts/latest",
		optionalAuthMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				const store = new PostsKVStore(c.env.KV);
				const latestPost = await store.getLatestPost();

				return c.json({
					success: true,
					data: latestPost,
					message: latestPost ? "最新文章获取成功" : "暂无文章",
				});
			} catch (error) {
				console.error("获取最新文章失败:", error);
				throw new HTTPException(500, {
					message: "获取最新文章失败",
					cause: error,
				});
			}
		},
	)

	// GET /posts/:id - 获取特定文章
	.get("/posts/:id", optionalAuthMiddleware, loggingMiddleware, async (c) => {
		try {
			const id = c.req.param("id");

			if (!id) {
				throw new HTTPException(400, {
					message: "无效的文章ID",
				});
			}

			const store = new PostsKVStore(c.env.KV);
			const post = await store.getPost(id);

			if (!post) {
				throw new HTTPException(404, {
					message: "文章不存在",
				});
			}

			return c.json({
				success: true,
				data: post,
			});
		} catch (error) {
			console.error("获取文章失败:", error);
			throw new HTTPException(500, {
				message: "获取文章失败",
				cause: error,
			});
		}
	})

	// PUT /posts/:id - 更新文章（需要认证）
	.put(
		"/posts/:id",
		authMiddleware,
		zValidator("json", postUpdateSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const id = c.req.param("id");
				const updates = c.req.valid("json");

				if (!id) {
					throw new HTTPException(400, {
						message: "无效的文章ID",
					});
				}

				const store = new PostsKVStore(c.env.KV);
				const updatedPost = await store.updatePost(id, updates);

				if (!updatedPost) {
					throw new HTTPException(404, {
						message: "文章不存在",
					});
				}

				return c.json({
					success: true,
					data: updatedPost,
					message: `文章《${updatedPost.title}》由 ${user?.name} 成功更新`,
				});
			} catch (error) {
				console.error("更新文章失败:", error);
				throw new HTTPException(500, {
					message: "更新文章失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /posts/:id - 删除文章（需要认证）
	.delete("/posts/:id", authMiddleware, loggingMiddleware, async (c) => {
		try {
			const user = c.get("user");
			const id = c.req.param("id");

			if (!id) {
				throw new HTTPException(400, {
					message: "无效的文章ID",
				});
			}

			const store = new PostsKVStore(c.env.KV);

			// 先获取文章信息用于返回消息
			const existingPost = await store.getPost(id);
			if (!existingPost) {
				throw new HTTPException(404, {
					message: "文章不存在",
				});
			}

			const deleted = await store.deletePost(id);
			if (!deleted) {
				throw new HTTPException(500, {
					message: "删除失败",
				});
			}

			return c.json({
				success: true,
				message: `文章《${existingPost.title}》由 ${user?.name} 成功删除`,
			});
		} catch (error) {
			console.error("删除文章失败:", error);
			throw new HTTPException(500, {
				message: "删除文章失败",
				cause: error,
			});
		}
	});

export const postsRouter = app;
export type PostsRouterType = typeof app;
