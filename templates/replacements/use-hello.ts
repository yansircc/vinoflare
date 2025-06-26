import { useQuery } from "@tanstack/react-query";
import { hc } from "@/server/lib/hc";

// Create the client
const client = hc();

// Hook for getting hello message
export function useHello() {
	return useQuery({
		queryKey: ["hello"],
		queryFn: async () => {
			const response = await client.api.hello.$get();
			if (!response.ok) {
				throw new Error("Failed to fetch hello message");
			}
			return response.json();
		},
	});
}