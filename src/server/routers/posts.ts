import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "../middleware/procedures";
import type { BaseContext } from "../types/context";

const postCreateSchema = z.object({
	title: z.string().min(1, "标题不能为空"),
	content: z.string().min(1, "内容不能为空"),
});

const postUpdateSchema = z.object({
	title: z.string().min(1, "标题不能为空").optional(),
	content: z.string().min(1, "内容不能为空").optional(),
});

const querySchema = z.object({
	page: z.string().default("1").transform(Number),
	limit: z.string().default("10").transform(Number),
	sort: z.enum(["newest", "oldest"]).default("newest"),
});

// Post 类型定义
interface Post {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt?: string;
}

// KV 存储的辅助函数
class PostsKVStore {
	constructor(private kv: KVNamespace) {}

	// 生成新的 post ID（使用时间戳 + 随机数）
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	// 获取所有 post IDs（按时间排序）
	async getAllPostIds(): Promise<string[]> {
		const postIds =
			((await this.kv.get("posts:ids", "json")) as string[]) || [];
		return postIds;
	}

	// 保存 post IDs 列表
	async savePostIds(postIds: string[]): Promise<void> {
		await this.kv.put("posts:ids", JSON.stringify(postIds));
	}

	// 创建新文章
	async createPost(title: string, content: string): Promise<Post> {
		const id = this.generateId();
		const now = new Date().toISOString();

		const post: Post = {
			id,
			title,
			content,
			createdAt: now,
		};

		// 保存文章内容
		await this.kv.put(`post:${id}`, JSON.stringify(post));

		// 更新文章 ID 列表（新文章添加到开头）
		const postIds = await this.getAllPostIds();
		postIds.unshift(id);
		await this.savePostIds(postIds);

		// 更新最新文章 ID
		await this.kv.put("posts:latest", id);

		return post;
	}

	// 获取单个文章
	async getPost(id: string): Promise<Post | null> {
		const postData = (await this.kv.get(`post:${id}`, "json")) as Post | null;
		return postData;
	}

	// 获取最新文章
	async getLatestPost(): Promise<Post | null> {
		const latestId = await this.kv.get("posts:latest", "text");
		if (!latestId) return null;
		return this.getPost(latestId);
	}

	// 获取文章列表（支持分页）
	async getPosts(
		page = 1,
		limit = 10,
		sort: "newest" | "oldest" = "newest",
	): Promise<{
		posts: Post[];
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	}> {
		let postIds = await this.getAllPostIds();

		// 排序
		if (sort === "oldest") {
			postIds = postIds.reverse();
		}

		const totalCount = postIds.length;
		const totalPages = Math.ceil(totalCount / limit);
		const offset = (page - 1) * limit;

		// 分页
		const pagePostIds = postIds.slice(offset, offset + limit);

		// 获取文章内容
		const posts: Post[] = [];
		for (const id of pagePostIds) {
			const post = await this.getPost(id);
			if (post) posts.push(post);
		}

		return {
			posts,
			totalCount,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		};
	}

	// 更新文章
	async updatePost(
		id: string,
		updates: Partial<Pick<Post, "title" | "content">>,
	): Promise<Post | null> {
		const existingPost = await this.getPost(id);
		if (!existingPost) return null;

		const updatedPost: Post = {
			...existingPost,
			...updates,
			updatedAt: new Date().toISOString(),
		};

		await this.kv.put(`post:${id}`, JSON.stringify(updatedPost));
		return updatedPost;
	}

	// 删除文章
	async deletePost(id: string): Promise<boolean> {
		const existingPost = await this.getPost(id);
		if (!existingPost) return false;

		// 删除文章内容
		await this.kv.delete(`post:${id}`);

		// 从 ID 列表中移除
		const postIds = await this.getAllPostIds();
		const updatedIds = postIds.filter((postId) => postId !== id);
		await this.savePostIds(updatedIds);

		// 如果删除的是最新文章，更新最新文章 ID
		const latestId = await this.kv.get("posts:latest", "text");
		if (latestId === id) {
			const newLatestId = updatedIds[0] || null;
			if (newLatestId) {
				await this.kv.put("posts:latest", newLatestId);
			} else {
				await this.kv.delete("posts:latest");
			}
		}

		return true;
	}
}

// 按照 Hono RPC 模式创建文章路由器
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
				return c.json(
					{
						success: false,
						error: "无效的文章ID",
					},
					400,
				);
			}

			const store = new PostsKVStore(c.env.KV);
			const post = await store.getPost(id);

			if (!post) {
				return c.json(
					{
						success: false,
						error: "文章不存在",
					},
					404,
				);
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
					return c.json(
						{
							success: false,
							error: "无效的文章ID",
						},
						400,
					);
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
				return c.json(
					{
						success: false,
						error: "无效的文章ID",
					},
					400,
				);
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
