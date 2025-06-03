import { createMiddleware } from "hono/factory";
import type { BaseContext } from "../lib/types";

/**
 * 延迟中间件配置选项
 */
interface DelayOptions {
	/** 固定延迟时间（毫秒），如果设置了则忽略 min 和 max */
	fixed?: number;
	/** 最小延迟时间（毫秒） */
	min?: number;
	/** 最大延迟时间（毫秒） */
	max?: number;
	/** 是否启用延迟，默认仅在非生产环境启用 */
	enabled?: boolean;
	/** 需要排除的路径模式 */
	excludePaths?: string[];
}

/**
 * 获取随机延迟时间
 */
const getRandomDelay = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 检查路径是否应该被排除
 */
const shouldExcludePath = (path: string, excludePaths: string[]): boolean => {
	return excludePaths.some((pattern) => {
		// 支持简单的通配符匹配
		const regex = new RegExp(pattern.replace(/\*/g, ".*"));
		return regex.test(path);
	});
};

/**
 * 延迟中间件 - 用于在开发环境模拟网络延迟
 */
export const delayMiddleware = (options: DelayOptions = {}) => {
	const {
		fixed,
		min = 100,
		max = 500,
		enabled,
		excludePaths = ["/doc", "/health", "/ping"],
	} = options;

	return createMiddleware<BaseContext>(async (c, next) => {
		// 默认仅在非生产环境启用
		const shouldDelay =
			enabled !== undefined ? enabled : c.env.NODE_ENV === "development";

		if (!shouldDelay) {
			return next();
		}

		// 检查是否需要排除当前路径
		if (shouldExcludePath(c.req.path, excludePaths)) {
			return next();
		}

		// 计算延迟时间
		const delayTime = fixed !== undefined ? fixed : getRandomDelay(min, max);

		// 添加延迟
		await new Promise((resolve) => setTimeout(resolve, delayTime));

		// 在开发环境下可以在控制台输出延迟信息
		if (c.env.NODE_ENV === "development") {
			console.log(
				`🐌 Simulated delay: ${delayTime}ms for ${c.req.method} ${c.req.path}`,
			);
		}

		return next();
	});
};

/**
 * 预设的延迟配置
 */
export const DelayPresets = {
	/** 快速网络 (50-150ms) */
	fast: { min: 50, max: 150 },
	/** 普通网络 (100-500ms) */
	normal: { min: 100, max: 500 },
	/** 慢速网络 (500-1500ms) */
	slow: { min: 500, max: 1500 },
	/** 非常慢的网络 (1000-3000ms) */
	verySlow: { min: 1000, max: 3000 },
	/** 固定延迟 */
	fixed: (ms: number) => ({ fixed: ms }),
} as const;
