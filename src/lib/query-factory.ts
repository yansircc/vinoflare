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
