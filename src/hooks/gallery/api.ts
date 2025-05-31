import { client } from "@/server/api";

import {
	type PaginatedResponse,
	createCrudHooks,
	createQueryKeys,
} from "@/lib/query-factory";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
	GalleryImageItem,
	UploadGalleryImageRequest,
	UploadGalleryImageResponse,
} from "./types";

// 创建 Query Keys
const galleryKeys = createQueryKeys("gallery");

// 定义 API 接口
const galleryApi = {
	getAll: async (filters?: {
		page?: number;
		limit?: number;
		sort?: "newest" | "oldest";
	}): Promise<PaginatedResponse<GalleryImageItem>> => {
		const { page = 1, limit = 12, sort = "newest" } = filters || {};
		const response = await client.gallery.$get({
			query: {
				page: page.toString(),
				limit: limit.toString(),
				sort: sort as "newest" | "oldest",
			},
		});
		return response.json();
	},

	getById: async (id: string | number): Promise<GalleryImageItem> => {
		const response = await client.gallery[":id"].$get({
			param: { id: id.toString() },
		});
		return response.json();
	},

	create: async (
		data: UploadGalleryImageRequest,
	): Promise<GalleryImageItem> => {
		const response = await client.gallery.$post({ form: data });
		return response.json();
	},

	update: async (params: {
		id: string | number;
		data: any; // Gallery doesn't have update functionality, placeholder
	}): Promise<GalleryImageItem> => {
		// Gallery 通常不支持更新操作，这里作为占位符
		throw new Error("Gallery update not supported");
	},

	delete: async (id: string | number): Promise<void> => {
		await client.gallery[":id"].$delete({
			param: { id: id.toString() },
		});
	},
};

// 使用 createCrudHooks 生成标准 CRUD 操作
const galleryCrud = createCrudHooks({
	resource: "gallery",
	api: galleryApi,
	getId: (item: GalleryImageItem) => item.fileName,
	messages: {
		createSuccess: "图片上传成功",
		createError: "图片上传失败",
		updateSuccess: "图片更新成功",
		updateError: "图片更新失败",
		deleteSuccess: "图片删除成功",
		deleteError: "删除图片失败",
	},
});

// 导出标准 CRUD 操作
export const useGalleryImages = galleryCrud.useList;
export const useGalleryImage = galleryCrud.useItem;
export const useUploadGalleryImage = galleryCrud.useCreate;
export const useDeleteGalleryImage = galleryCrud.useDelete;

// 特殊操作：获取图库统计
export const useGalleryStats = () => {
	return useQuery({
		queryKey: [...galleryKeys.all, "stats"],
		queryFn: async () => {
			const response = await client.gallery.stats.$get();
			return response.json();
		},
	});
};

// 批量上传图片（保留原有逻辑）
export const useBatchUploadGalleryImages = () => {
	return useMutation<
		UploadGalleryImageResponse[],
		Error,
		UploadGalleryImageRequest[]
	>({
		mutationFn: async (formDataArray) => {
			const uploadPromises = formDataArray.map(async (formData) => {
				const response = await client.gallery.$post({
					form: formData,
				});
				return response.json();
			});

			return await Promise.all(uploadPromises);
		},
		meta: {
			customSuccessMessage: "批量上传成功",
			customErrorMessage: "批量上传失败",
			optimisticUpdate: {
				queryKey: galleryKeys.lists(),
				type: "add",
			},
		},
	});
};

// 获取图片 URL (用于预览)
export const getImageUrl = (fileName: string): string => {
	return "/api/gallery/" + fileName + "/image";
};
