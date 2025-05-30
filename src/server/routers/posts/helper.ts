import type { Post } from "./types";

// KV 存储的辅助函数
export class PostsKVStore {
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
