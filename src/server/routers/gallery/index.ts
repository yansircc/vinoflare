import {
	authMiddleware,
	loggingMiddleware,
	optionalAuthMiddleware,
} from "@/server/middleware/procedures";
import type { BaseContext } from "@/server/types/context";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
	galleryIdSchema,
	galleryUploadSchema,
	generateFileName,
	getContentType,
} from "./helper";

// 创建 Gallery 路由器
const app = new Hono<BaseContext>()
	// GET /gallery - 获取所有图片
	.get("/gallery", optionalAuthMiddleware, loggingMiddleware, async (c) => {
		try {
			// 从 R2 获取所有图片文件
			const list = await c.env.IMG_BUCKET.list();

			// 对每个对象获取完整的 metadata
			const images = await Promise.all(
				list.objects.map(async (object) => {
					// 使用 head() 获取完整的 metadata
					const objectWithMeta = await c.env.IMG_BUCKET.head(object.key);
					return {
						fileName: object.key,
						size: object.size,
						uploaded: object.uploaded,
						// 从 head() 获取的完整 metadata
						title: objectWithMeta?.customMetadata?.title || object.key,
						description: objectWithMeta?.customMetadata?.description || "",
						uploadedBy: objectWithMeta?.customMetadata?.uploadedBy || "unknown",
						imageUrl: `/api/gallery/${object.key}/image`,
					};
				}),
			);

			// 按上传时间倒序排列
			images.sort(
				(a, b) =>
					new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime(),
			);

			return c.json({
				success: true,
				data: images,
				count: images.length,
				requestedBy: c.get("user")?.name || "anonymous",
			});
		} catch (error) {
			console.error("获取图片列表失败:", error);
			throw new HTTPException(500, {
				message: "获取图片列表失败",
				cause: error,
			});
		}
	})

	// GET /gallery/stats - 获取图库统计（必须在 :id 路由之前！）
	.get(
		"/gallery/stats",
		optionalAuthMiddleware,
		loggingMiddleware,
		async (c) => {
			try {
				// 从 R2 获取所有文件信息
				const list = await c.env.IMG_BUCKET.list();
				const objects = list.objects;

				const now = new Date();
				const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
				const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

				const stats = {
					total: objects.length,
					lastDay: objects.filter((obj) => {
						return new Date(obj.uploaded) > oneDayAgo;
					}).length,
					lastWeek: objects.filter((obj) => {
						return new Date(obj.uploaded) > oneWeekAgo;
					}).length,
					totalSize: objects.reduce((sum, obj) => sum + obj.size, 0),
					averageSize:
						objects.length > 0
							? Math.round(
									objects.reduce((sum, obj) => sum + obj.size, 0) /
										objects.length,
								)
							: 0,
				};

				return c.json({
					success: true,
					data: stats,
					generatedAt: now.toISOString(),
					requestedBy: c.get("user")?.name || "anonymous",
				});
			} catch (error) {
				console.error("获取图库统计失败:", error);
				throw new HTTPException(500, {
					message: "获取图库统计失败",
					cause: error,
				});
			}
		},
	)

	// GET /gallery/:id - 获取单个图片信息
	.get(
		"/gallery/:id",
		optionalAuthMiddleware,
		zValidator("param", galleryIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const { id } = c.req.valid("param");

				// 从 R2 获取文件信息
				const object = await c.env.IMG_BUCKET.head(id);

				if (!object) {
					throw new HTTPException(404, {
						message: "图片不存在",
					});
				}

				const imageInfo = {
					fileName: id,
					size: object.size,
					uploaded: object.uploaded,
					title: object.customMetadata?.title || id,
					description: object.customMetadata?.description || "",
					uploadedBy: object.customMetadata?.uploadedBy || "unknown",
					imageUrl: `/api/gallery/${id}/image`,
				};

				return c.json({
					success: true,
					data: imageInfo,
				});
			} catch (error) {
				console.error("获取图片失败:", error);
				if (error instanceof HTTPException) {
					throw error;
				}
				throw new HTTPException(500, {
					message: "获取图片失败",
					cause: error,
				});
			}
		},
	)

	// POST /gallery - 上传新图片（需要认证）
	.post(
		"/gallery",
		authMiddleware,
		zValidator("form", galleryUploadSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");

				const { file, title, description } = c.req.valid("form");

				// 验证文件是否存在
				if (!file || !(file instanceof File)) {
					throw new HTTPException(400, {
						message: "请选择要上传的文件",
					});
				}

				// 验证文件类型
				const allowedTypes = [
					"image/jpeg",
					"image/png",
					"image/gif",
					"image/webp",
				];
				if (!allowedTypes.includes(file.type)) {
					throw new HTTPException(400, {
						message: "不支持的文件类型，仅支持 JPEG、PNG、GIF、WebP 格式",
					});
				}

				// 验证文件大小 (5MB 限制)
				const maxSize = 5 * 1024 * 1024; // 5MB
				if (file.size > maxSize) {
					throw new HTTPException(400, {
						message: "文件大小不能超过 5MB",
					});
				}

				// 生成唯一文件名
				const fileName = generateFileName(file.name);
				const contentType = getContentType(file.name);

				// 上传到 R2，包含元数据
				try {
					const putOptions = {
						httpMetadata: {
							contentType,
						},
						customMetadata: {
							title: title || file.name,
							description: description || "",
							uploadedBy: user?.name || "anonymous",
							originalName: file.name,
						},
					};
					await c.env.IMG_BUCKET.put(fileName, file.stream(), putOptions);
				} catch (r2Error) {
					console.error("R2 上传失败:", r2Error);
					throw new HTTPException(500, {
						message: "文件上传失败",
					});
				}

				const imageInfo = {
					fileName,
					title: title || file.name,
					description: description || "",
					uploadedBy: user?.name || "anonymous",
					originalName: file.name,
					fileSize: file.size,
					mimeType: file.type,
					imageUrl: `/api/gallery/${fileName}/image`,
				};

				return c.json(
					{
						success: true,
						data: imageInfo,
						message: `图片"${title || file.name}"由 ${user?.name || "anonymous"} 成功上传`,
					},
					201,
				);
			} catch (error) {
				console.error("上传图片失败:", error);
				if (error instanceof HTTPException) {
					throw error;
				}
				throw new HTTPException(500, {
					message: "上传图片失败",
					cause: error,
				});
			}
		},
	)

	// DELETE /gallery/:id - 删除图片（需要认证）
	.delete(
		"/gallery/:id",
		authMiddleware,
		zValidator("param", galleryIdSchema),
		loggingMiddleware,
		async (c) => {
			try {
				const user = c.get("user");
				const { id } = c.req.valid("param");

				// 检查图片是否存在
				const object = await c.env.IMG_BUCKET.head(id);

				if (!object) {
					throw new HTTPException(404, {
						message: "图片不存在",
					});
				}

				// 从 R2 删除文件
				try {
					await c.env.IMG_BUCKET.delete(id);
				} catch (r2Error) {
					console.error("R2 删除失败:", r2Error);
					throw new HTTPException(500, {
						message: "删除失败",
					});
				}

				return c.json({
					success: true,
					message: `图片"${object.customMetadata?.title || id}"由 ${user?.name} 成功删除`,
					deletedFileName: id,
				});
			} catch (error) {
				console.error("删除图片失败:", error);
				if (error instanceof HTTPException) {
					throw error;
				}
				throw new HTTPException(500, {
					message: "删除图片失败",
					cause: error,
				});
			}
		},
	)

	// GET /gallery/:id/image - 直接从 R2 获取图片文件
	.get(
		"/gallery/:id/image",
		zValidator("param", galleryIdSchema),
		async (c) => {
			try {
				const { id } = c.req.valid("param");

				// 从 R2 获取文件
				const object = await c.env.IMG_BUCKET.get(id);

				if (!object) {
					throw new HTTPException(404, {
						message: "图片文件不存在",
					});
				}

				// 设置响应头
				return new Response(object.body, {
					headers: {
						"Content-Type": object.httpMetadata?.contentType || "image/jpeg",
						"Content-Length": object.size.toString(),
						"Cache-Control": "public, max-age=31536000", // 缓存1年
					},
				});
			} catch (error) {
				console.error("获取图片文件失败:", error);
				if (error instanceof HTTPException) {
					throw error;
				}
				throw new HTTPException(500, {
					message: "获取图片文件失败",
					cause: error,
				});
			}
		},
	);

export const galleryRouter = app;
export type GalleryRouterType = typeof app;
