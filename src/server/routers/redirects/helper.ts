import type { Redirects } from "./types";

// KV 存储的辅助函数
export class RedirectssKVStore {
	constructor(private kv: KVNamespace) {}

	// 生成随机短码
	private generateShortCode(length = 6): string {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	// 生成新的 ID
	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}

	// 检查短码是否已存在
	async isShortCodeExists(shortCode: string): Promise<boolean> {
		const existing = await this.kv.get(`short:${shortCode}`, "json");
		return existing !== null;
	}

	// 生成唯一的短码
	async generateUniqueShortCode(customCode?: string): Promise<string> {
		if (customCode) {
			const exists = await this.isShortCodeExists(customCode);
			if (exists) {
				throw new Error("自定义代码已存在，请选择其他代码");
			}
			return customCode;
		}

		// 生成随机短码，确保唯一性
		let shortCode: string;
		let attempts = 0;
		const maxAttempts = 10;

		do {
			shortCode = this.generateShortCode();
			attempts++;
			if (attempts >= maxAttempts) {
				throw new Error("生成短码失败，请重试");
			}
		} while (await this.isShortCodeExists(shortCode));

		return shortCode;
	}

	// 获取所有短链接 IDs（按时间排序）
	async getAllRedirectsIds(): Promise<string[]> {
		const redirectsIds =
			((await this.kv.get("redirectss:ids", "json")) as string[]) || [];
		return redirectsIds;
	}

	// 保存短链接 IDs 列表
	async saveRedirectsIds(redirectsIds: string[]): Promise<void> {
		await this.kv.put("redirectss:ids", JSON.stringify(redirectsIds));
	}

	// 创建新短链接
	async createRedirects(
		originalUrl: string,
		customCode?: string,
		createdBy?: string,
	): Promise<Redirects> {
		const id = this.generateId();
		const shortCode = await this.generateUniqueShortCode(customCode);
		const now = new Date().toISOString();

		const redirects: Redirects = {
			id,
			shortCode,
			originalUrl,
			visits: 0,
			createdAt: now,
			createdBy,
		};

		// 保存短链接内容（使用短码作为键）
		await this.kv.put(`short:${shortCode}`, JSON.stringify(redirects));

		// 保存短链接详情（使用ID作为键，用于管理）
		await this.kv.put(`redirects:${id}`, JSON.stringify(redirects));

		// 更新短链接 ID 列表（新短链接添加到开头）
		const redirectsIds = await this.getAllRedirectsIds();
		redirectsIds.unshift(id);
		await this.saveRedirectsIds(redirectsIds);

		// 更新最新短链接 ID
		await this.kv.put("redirectss:latest", id);

		return redirects;
	}

	// 通过短码获取短链接（用于重定向）
	async getRedirectsByCode(shortCode: string): Promise<Redirects | null> {
		const redirectsData = (await this.kv.get(
			`short:${shortCode}`,
			"json",
		)) as Redirects | null;
		return redirectsData;
	}

	// 通过ID获取短链接（用于管理）
	async getRedirects(id: string): Promise<Redirects | null> {
		const redirectsData = (await this.kv.get(
			`redirects:${id}`,
			"json",
		)) as Redirects | null;
		return redirectsData;
	}

	// 访问短链接（增加访问次数并返回原始URL）
	async visitRedirects(shortCode: string): Promise<string | null> {
		const redirects = await this.getRedirectsByCode(shortCode);
		if (!redirects) return null;

		// 更新访问次数和最后访问时间
		redirects.visits += 1;
		redirects.lastVisitedAt = new Date().toISOString();

		// 保存更新后的数据
		await this.kv.put(`short:${shortCode}`, JSON.stringify(redirects));
		await this.kv.put(`redirects:${redirects.id}`, JSON.stringify(redirects));

		return redirects.originalUrl;
	}

	// 获取短链接列表（支持分页和排序）
	async getRedirectss(
		page = 1,
		limit = 10,
		sort: "newest" | "oldest" | "visits" = "newest",
	): Promise<{
		redirectss: Redirects[];
		totalCount: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	}> {
		const redirectsIds = await this.getAllRedirectsIds();

		const totalCount = redirectsIds.length;
		const totalPages = Math.ceil(totalCount / limit);
		const offset = (page - 1) * limit;

		// 获取短链接数据用于排序
		const redirectssForSort: Redirects[] = [];
		for (const id of redirectsIds) {
			const redirects = await this.getRedirects(id);
			if (redirects) redirectssForSort.push(redirects);
		}

		// 排序
		redirectssForSort.sort((a, b) => {
			switch (sort) {
				case "oldest":
					return (
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				case "visits":
					return b.visits - a.visits;
				default:
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
			}
		});

		// 分页
		const redirectss = redirectssForSort.slice(offset, offset + limit);

		return {
			redirectss,
			totalCount,
			totalPages,
			hasNext: page < totalPages,
			hasPrev: page > 1,
		};
	}

	// 更新短链接
	async updateRedirects(
		id: string,
		updates: Partial<Pick<Redirects, "originalUrl">>,
	): Promise<Redirects | null> {
		const existingRedirects = await this.getRedirects(id);
		if (!existingRedirects) return null;

		const updatedRedirects: Redirects = {
			...existingRedirects,
			...updates,
			updatedAt: new Date().toISOString(),
		};

		// 更新两个存储位置
		await this.kv.put(
			`short:${existingRedirects.shortCode}`,
			JSON.stringify(updatedRedirects),
		);
		await this.kv.put(`redirects:${id}`, JSON.stringify(updatedRedirects));

		return updatedRedirects;
	}

	// 删除短链接
	async deleteRedirects(id: string): Promise<boolean> {
		const existingRedirects = await this.getRedirects(id);
		if (!existingRedirects) return false;

		// 删除短链接数据
		await this.kv.delete(`short:${existingRedirects.shortCode}`);
		await this.kv.delete(`redirects:${id}`);

		// 从 ID 列表中移除
		const redirectsIds = await this.getAllRedirectsIds();
		const updatedIds = redirectsIds.filter((redirectsId) => redirectsId !== id);
		await this.saveRedirectsIds(updatedIds);

		// 如果删除的是最新短链接，更新最新短链接 ID
		const latestId = await this.kv.get("redirectss:latest", "text");
		if (latestId === id) {
			const newLatestId = updatedIds[0] || null;
			if (newLatestId) {
				await this.kv.put("redirectss:latest", newLatestId);
			} else {
				await this.kv.delete("redirectss:latest");
			}
		}

		return true;
	}

	// 获取统计信息
	async getStats(): Promise<{
		totalLinks: number;
		totalVisits: number;
		todayVisits: number;
		topLinks: Array<{ shortCode: string; originalUrl: string; visits: number }>;
	}> {
		const redirectsIds = await this.getAllRedirectsIds();
		const allRedirectss: Redirects[] = [];

		for (const id of redirectsIds) {
			const redirects = await this.getRedirects(id);
			if (redirects) allRedirectss.push(redirects);
		}

		const totalVisits = allRedirectss.reduce(
			(sum, link) => sum + link.visits,
			0,
		);

		// 计算今日访问量（简化实现，实际应该根据访问时间统计）
		const today = new Date().toDateString();
		const todayVisits = allRedirectss
			.filter(
				(link) =>
					link.lastVisitedAt &&
					new Date(link.lastVisitedAt).toDateString() === today,
			)
			.reduce((sum, link) => sum + link.visits, 0);

		// 获取访问量最高的链接
		const topLinks = allRedirectss
			.sort((a, b) => b.visits - a.visits)
			.slice(0, 5)
			.map((link) => ({
				shortCode: link.shortCode,
				originalUrl: link.originalUrl,
				visits: link.visits,
			}));

		return {
			totalLinks: allRedirectss.length,
			totalVisits,
			todayVisits,
			topLinks,
		};
	}
}
