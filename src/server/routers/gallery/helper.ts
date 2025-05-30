import { z } from "zod";

// Gallery 相关的验证 schemas
export const galleryUploadSchema = z.object({
	file: z.instanceof(File),
	title: z.string().max(100).optional(),
	description: z.string().max(500).optional(),
});

export const galleryIdSchema = z.object({
	id: z.string().min(1),
});

// 辅助函数：生成唯一的文件名
export function generateFileName(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split(".").pop() || "";
	return `${timestamp}-${random}.${extension}`;
}

// 辅助函数：获取文件的 MIME 类型
export function getContentType(fileName: string): string {
	const extension = fileName.split(".").pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
	};
	return mimeTypes[extension || ""] || "application/octet-stream";
}
