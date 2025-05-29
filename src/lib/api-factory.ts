import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn: config.api.create,
			onSuccess: () => {
				// 使列表失效，触发重新获取
				queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
			},
		});
	};

	// 更新项目
	const useUpdate = () => {
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn: config.api.update,
			onSuccess: (data) => {
				// 更新缓存中的列表
				queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
				// 更新单个项目的缓存
				queryClient.setQueryData(queryKeys.detail(config.getId(data)), data);
			},
		});
	};

	// 删除项目
	const useDelete = () => {
		const queryClient = useQueryClient();

		return useMutation({
			mutationFn: config.api.delete,
			onSuccess: () => {
				// 使列表失效，触发重新获取
				queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
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
