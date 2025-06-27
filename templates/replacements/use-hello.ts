import { useGetHello } from "@/generated/endpoints/hello/hello";

// Hook for getting hello message
export function useHello() {
	const { data, isLoading, error } = useGetHello();

	return {
		data,
		isLoading,
		error,
	};
}
