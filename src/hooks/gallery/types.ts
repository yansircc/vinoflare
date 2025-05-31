import type { client } from "@/server/api";
import type { InferRequestType, InferResponseType } from "hono/client";
import { z } from "zod";

// 图片上传表单的 Zod schema
export const galleryUploadFormSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.size > 0, "请选择一个文件")
		.refine((file) => file.size <= 5 * 1024 * 1024, "文件大小不能超过 5MB")
		.refine(
			(file) =>
				["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
					file.type,
				),
			"仅支持 JPEG、PNG、GIF、WebP 格式",
		),

	title: z.union([
		z.string().min(1, "标题不能为空").max(100, "标题不能超过100个字符"),
		z.literal(""),
	]),

	description: z.union([
		z.string().min(1, "描述不能为空").max(500, "描述不能超过500个字符"),
		z.literal(""),
	]),
});

// 图片信息类型
export interface GalleryImage {
	fileName: string;
	size: number;
	uploaded: string;
	title: string;
	description: string;
	uploadedBy: string;
	imageUrl: string;
	originalName?: string;
	fileSize?: number;
	mimeType?: string;
}

// 图库统计类型
export interface GalleryStats {
	total: number;
	lastDay: number;
	lastWeek: number;
	totalSize: number;
	averageSize: number;
}

// 导出表单类型
export type GalleryUploadFormData = z.infer<typeof galleryUploadFormSchema>;

// 默认值
export const defaultGalleryUploadFormValues: Partial<GalleryUploadFormData> = {
	title: "",
	description: "",
};

// 从 Hono RPC 推断类型，更加类型安全
export type GetGalleryImagesResponse = InferResponseType<
	typeof client.gallery.$get
>;
export type GetGalleryImageResponse = InferResponseType<
	(typeof client.gallery)[":id"]["$get"]
>;
export type UploadGalleryImageRequest = InferRequestType<
	typeof client.gallery.$post
>["form"];
export type UploadGalleryImageResponse = InferResponseType<
	typeof client.gallery.$post
>;
export type DeleteGalleryImageResponse = InferResponseType<
	(typeof client.gallery)[":id"]["$delete"]
>;
export type GetGalleryStatsResponse = InferResponseType<
	(typeof client.gallery.stats)["$get"]
>;

// 文件预览类型
export interface FilePreview {
	file: File;
	preview: string;
	title?: string;
	description?: string;
}
