import { client } from "@/server/api";

import { createQueryKeys } from "@/lib/query-factory";
import { apiWrapperWithJson } from "@/utils/api-wrapper";
import { useMutation, useQuery } from "@tanstack/react-query";

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
		queryFn: async () => {
			return apiWrapperWithJson<GetGalleryImagesResponse>(() =>
				client.gallery.$get(),
			);
		},
	});
};

// 获取单个图片信息
export const useGalleryImage = (fileName: string) => {
	return useQuery({
		queryKey: galleryKeys.detail(fileName),
		queryFn: async () => {
			return apiWrapperWithJson<GetGalleryImageResponse>(() =>
				client.gallery[":id"].$get({
					param: { id: fileName },
				}),
			);
		},
		enabled: !!fileName,
	});
};

// 获取图库统计
export const useGalleryStats = () => {
	return useQuery({
		queryKey: [...galleryKeys.all, "stats"],
		queryFn: async () => {
			return apiWrapperWithJson<GetGalleryStatsResponse>(() =>
				client.gallery.stats.$get(),
			);
		},
	});
};

// 上传图片
export const useUploadGalleryImage = () => {
	return useMutation<
		UploadGalleryImageResponse,
		Error,
		UploadGalleryImageRequest
	>({
		mutationFn: async (formData) => {
			return apiWrapperWithJson<UploadGalleryImageResponse>(() =>
				client.gallery.$post({
					form: formData,
				}),
			);
		},
		meta: {
			customSuccessMessage: "图片上传成功",
			customErrorMessage: "图片上传失败",
			invalidateQueries: {
				queryKey: galleryKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 删除图片
export const useDeleteGalleryImage = () => {
	return useMutation<DeleteGalleryImageResponse, Error, string>({
		mutationFn: async (fileName) => {
			return apiWrapperWithJson<DeleteGalleryImageResponse>(() =>
				client.gallery[":id"].$delete({
					param: { id: fileName },
				}),
			);
		},
		meta: {
			customSuccessMessage: "图片删除成功",
			customErrorMessage: "删除图片失败",
			invalidateQueries: {
				queryKey: galleryKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 批量上传图片
export const useBatchUploadGalleryImages = () => {
	return useMutation<
		UploadGalleryImageResponse[],
		Error,
		UploadGalleryImageRequest[]
	>({
		mutationFn: async (formDataArray) => {
			const uploadPromises = formDataArray.map(async (formData) => {
				return apiWrapperWithJson<UploadGalleryImageResponse>(() =>
					client.gallery.$post({
						form: formData,
					}),
				);
			});

			return await Promise.all(uploadPromises);
		},
		meta: {
			customSuccessMessage: "批量上传成功",
			customErrorMessage: "批量上传失败",
			invalidateQueries: {
				queryKey: galleryKeys.all.map((key) => key.toString()),
			},
		},
	});
};

// 获取图片 URL (用于预览)
export const getImageUrl = (fileName: string): string => {
	return "/api/gallery/" + fileName + "/image";
};
