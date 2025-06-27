import { cn, colors, text } from "@/client/lib/design";
import { useGetHello } from "@/generated/endpoints/hello/hello";

export function HelloDemo() {
	const { data, isLoading, error } = useGetHello();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-gray-500">Loading...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center p-8">
				<div className="text-red-500">Error loading data</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className={cn(text.h2, "mb-2")}>API Demo</h2>
			<div className="space-y-2">
				<p className={cn(text.large)}>
					{data?.message || "Hello from /api/hello"}
				</p>
				<p className={cn(text.small, colors.text.muted)}>
					{data?.time
						? new Date(data.time).toLocaleString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
							})
						: "No timestamp"}
				</p>
			</div>
		</div>
	);
}
