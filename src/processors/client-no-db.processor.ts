import path from "node:path";
import type { ExecutionContext } from "../types";
import { createFileOperations } from "../utils/file-operations";
import { BaseProcessor } from "./types";

/**
 * Processor for updating client files when database is disabled
 */
export class ClientNoDbProcessor extends BaseProcessor {
	name = "client-no-db";
	order = 35; // Run after feature cleanup

	shouldRun(context: ExecutionContext): boolean {
		return (
			context.config.type === "full-stack" && !context.hasFeature("database")
		);
	}

	async process(context: ExecutionContext): Promise<void> {
		context.logger.info("Updating client for no-database configuration...");

		const fileOps = createFileOperations(context.projectPath);

		// Create HelloDemo component
		const helloDemoContent = `import { useGetHello } from "@/generated/endpoints/hello/hello";
import { cn, colors, text } from "@/client/lib/design";

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
				<p className={cn(text.large)}>{data?.message || "Hello from /api/hello"}</p>
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
}`;

		await fileOps.write("src/client/components/hello-demo.tsx", helloDemoContent);

		// Update index.tsx to use HelloDemo instead of PostsList
		if (await fileOps.exists("src/client/routes/index.tsx")) {
			let content = await fileOps.read("src/client/routes/index.tsx");
			
			// Replace PostsList import with HelloDemo
			content = content.replace(
				/import { PostsList } from.*\n/g,
				'import { HelloDemo } from "@client/components/hello-demo";\n',
			);
			
			// Replace PostsList component with HelloDemo
			content = content.replace(/<PostsList\s*\/>/g, "<HelloDemo />");
			
			await fileOps.write("src/client/routes/index.tsx", content);
		}

		context.logger.success("Client updated for no-database configuration");
	}
}