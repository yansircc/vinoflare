import { client } from "@/api/client";

import { createQueryKeys } from "@/lib/query-factory";
import type { GalleryRouterType } from "@/server/routers/gallery";
import { catchError } from "@/utils/catchError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
	DeleteGalleryImageResponse,
	GetGalleryImageResponse,
	GetGalleryImagesResponse,
	GetGalleryStatsResponse,
	UploadGalleryImageRequest,
	UploadGalleryImageResponse,
} from "./types";

// 创建 Query Keys
const galleryKeys = createQueryKeys("gallery");

// Hooks

// 获取所有图片
export const useGalleryImages = () => {
	return useQuery({
		queryKey: galleryKeys.all,
		queryFn: async (): Promise<GetGalleryImagesResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.gallery.$get();
			});

			if (error || !result) {
				throw new Error("获取图片列表失败");
			}
			return result.json();
		},
	});
};

// 获取单个图片信息
export const useGalleryImage = (fileName: string) => {
	return useQuery({
		queryKey: galleryKeys.detail(fileName),
		queryFn: async (): Promise<GetGalleryImageResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.gallery[":id"].$get({
					param: { id: fileName },
				});
			});
			if (error || !result) {
				throw new Error("获取图片信息失败");
			}
			return result.json();
		},
		enabled: !!fileName,
	});
};

// 获取图库统计
export const useGalleryStats = () => {
	return useQuery({
		queryKey: [...galleryKeys.all, "stats"],
		queryFn: async (): Promise<GetGalleryStatsResponse> => {
			const { data: result, error } = await catchError(async () => {
				return await client.gallery.stats.$get();
			});

			if (error || !result) {
				throw new Error("获取图库统计失败");
			}
			return result.json();
		},
	});
};

// 上传图片
export const useUploadGalleryImage = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UploadGalleryImageResponse,
		Error,
		UploadGalleryImageRequest
	>({
		mutationFn: async (request) => {
			const { data: result, error } = await catchError(async () => {
				const file = new File(
					[request.file],
					request.title || request.file.name,
					{
						type: request.file.type,
					},
				);
				const response = await client.gallery.$post({
					form: {
						file,
						title: request.title,
						description: request.description,
					},
				});

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`HTTP ${response.status}: ${errorText}`);
				}

				return response.json() as Promise<UploadGalleryImageResponse>;
			});

			if (error || !result) {
				throw new Error("上传图片失败");
			}

			return result;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: galleryKeys.all });
			toast.success("图片上传成功！", {
				description: data.message,
			});
		},
		onError: (error) => {
			toast.error(error.message || "图片上传失败");
		},
	});
};

// 删除图片
export const useDeleteGalleryImage = () => {
	const queryClient = useQueryClient();

	return useMutation<DeleteGalleryImageResponse, Error, string>({
		mutationFn: async (fileName) => {
			const { data: result, error } = await catchError(async () => {
				const res = await client.gallery[":id"].$delete({
					param: { id: fileName },
				});
				return res.json();
			});
			if (error || !result) {
				throw new Error("删除图片失败");
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: galleryKeys.all });
			toast.success("图片删除成功！");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 批量上传图片
export const useBatchUploadGalleryImages = () => {
	const queryClient = useQueryClient();

	return useMutation<
		UploadGalleryImageResponse[],
		Error,
		UploadGalleryImageRequest[]
	>({
		mutationFn: async (formDataArray) => {
			const uploadPromises = formDataArray.map(async (formData) => {
				const { data: result, error } = await catchError(async () => {
					const res = await client.gallery.$post({
						form: formData,
					});
					return res.json();
				});
				if (error || !result) {
					throw new Error("上传文件失败");
				}
				return result;
			});

			return await Promise.all(uploadPromises);
		},
		onSuccess: (results) => {
			queryClient.invalidateQueries({ queryKey: galleryKeys.all });
			toast.success("批量上传成功！", {
				description: `共上传 ${results.length} 张图片`,
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
};

// 获取图片 URL (用于预览)
export const getImageUrl = (fileName: string): string => {
	return "/api/gallery/" + fileName + "/image";
};
