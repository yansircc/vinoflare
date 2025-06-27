import { cn, colors, text } from "@/client/lib/design";
import { useHello } from "../hooks/use-hello";

export function HelloDemo() {
	const { data, isLoading, error } = useHello();
	console.log(data);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center space-y-6">
			<p className={cn(text.large, colors.text.primary, "font-mono")}>
				{data?.message || "No message received"}
			</p>
		</div>
	);
}
