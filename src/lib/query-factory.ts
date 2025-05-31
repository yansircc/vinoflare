import { useMutation, useQuery } from "@tanstack/react-query";

// Query Key 工厂
export function createQueryKeys<T extends string>(resource: T) {
	return {
		all: [resource] as const,
		lists: () => [resource, "list"] as const,
		list: (filters?: any) => [resource, "list", { filters }] as const,
		details: () => [resource, "detail"] as const,
		detail: (id: string | number) => [resource, "detail", id] as const,
		latest: () => [resource, "latest"] as const,
	};
}

// 通用的 CRUD hooks 工厂
export function createCrudHooks<
	TItem,
	TCreateData,
	TUpdateData = Partial<TItem>,
	TListFilters = any,
>(config: {
	resource: string;
	api: {
		getAll: (filters?: TListFilters) => Promise<TItem[]>;
		getById: (id: string | number) => Promise<TItem>;
		create: (data: TCreateData) => Promise<TItem>;
		update: (params: {
			id: string | number;
			data: TUpdateData;
		}) => Promise<TItem>;
		delete: (id: string | number) => Promise<void>;
	};
	getId: (item: TItem) => string | number;
	// 可选：自定义消息
	messages?: {
		createSuccess?: string;
		createError?: string;
		updateSuccess?: string;
		updateError?: string;
		deleteSuccess?: string;
		deleteError?: string;
	};
}) {
	const queryKeys = createQueryKeys(config.resource);

	// 获取列表
	const useList = (filters?: TListFilters) => {
		return useQuery({
			queryKey: queryKeys.list(filters),
			queryFn: () => config.api.getAll(filters),
		});
	};

	// 获取单个项目
	const useItem = (id: string | number) => {
		return useQuery({
			queryKey: queryKeys.detail(id),
			queryFn: () => config.api.getById(id),
			enabled: !!id,
		});
	};

	// 创建项目
	const useCreate = () => {
		return useMutation({
			mutationFn: config.api.create,
			meta: {
				customSuccessMessage:
					config.messages?.createSuccess || `${config.resource}创建成功`,
				customErrorMessage:
					config.messages?.createError || `${config.resource}创建失败`,
				// 使用全局乐观更新配置
				optimisticUpdate: {
					queryKey: queryKeys.lists(),
					type: "add" as const,
				},
			},
		});
	};

	// 更新项目
	const useUpdate = () => {
		return useMutation({
			mutationFn: config.api.update,
			meta: {
				customSuccessMessage:
					config.messages?.updateSuccess || `${config.resource}更新成功`,
				customErrorMessage:
					config.messages?.updateError || `${config.resource}更新失败`,
				// 使用全局乐观更新配置
				optimisticUpdate: {
					queryKey: queryKeys.lists(),
					type: "update" as const,
					getId: (variables: { id: string | number; data: TUpdateData }) =>
						variables.id,
					// 自定义更新逻辑
					updater: (
						oldData: TItem[],
						variables: { id: string | number; data: TUpdateData },
					) => {
						if (!Array.isArray(oldData)) return oldData;
						return oldData.map((item: TItem) =>
							config.getId(item).toString() === variables.id.toString()
								? {
										...item,
										...variables.data,
										updatedAt: new Date().toISOString(),
									}
								: item,
						);
					},
				},
			},
		});
	};

	// 删除项目
	const useDelete = () => {
		return useMutation({
			mutationFn: config.api.delete,
			meta: {
				customSuccessMessage:
					config.messages?.deleteSuccess || `${config.resource}删除成功`,
				customErrorMessage:
					config.messages?.deleteError || `${config.resource}删除失败`,
				// 使用全局乐观更新配置
				optimisticUpdate: {
					queryKey: queryKeys.lists(),
					type: "delete" as const,
					getId: (variables: string | number) => variables,
				},
			},
		});
	};

	return {
		queryKeys,
		useList,
		useItem,
		useCreate,
		useUpdate,
		useDelete,
	};
}
