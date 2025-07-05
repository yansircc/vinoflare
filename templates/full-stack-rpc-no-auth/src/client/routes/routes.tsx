import { createFileRoute } from "@tanstack/react-router";
import { cn, colors, layout, spacing, text } from "@/client/lib/design";

export const Route = createFileRoute("/routes")({
	component: ApiPage,
});

const endpoints = [
	{
		title: "Health Check",
		method: "GET",
		path: "/api/health",
		description: "Returns the health status of the application",
	},
	{
		title: "Get Posts",
		method: "GET",
		path: "/api/posts/latest",
		description: "Returns a list of posts with pagination",
	},
	{
		title: "Create Post",
		method: "POST",
		path: "/api/posts",
		description: "Creates a new post",
		auth: true,
	},
];

function ApiPage() {
	return (
		<div className={spacing.page}>
			<div className={layout.container}>
				<div className="space-y-12">
					<div>
						<h1 className={cn(text.h1, "mb-2")}>API Documentation</h1>
						<p className={cn(text.large, colors.text.secondary)}>
							Available endpoints in this application
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2">
						{endpoints.map((endpoint) => (
							<div
								key={`${endpoint.method}-${endpoint.path}`}
								className="space-y-3"
							>
								<h3 className={cn(text.h3)}>{endpoint.title}</h3>

								<div className="flex items-center gap-3">
									<span
										className={cn(
											"px-2 py-1 font-mono text-xs",
											endpoint.method === "GET"
												? "bg-green-50 text-green-700"
												: "bg-blue-50 text-blue-700",
										)}
									>
										{endpoint.method}
									</span>
									<code
										className={cn("font-mono", text.small, colors.text.primary)}
									>
										{endpoint.path}
									</code>
								</div>

								<p className={cn(text.base, colors.text.secondary)}>
									{endpoint.description}
								</p>

								{endpoint.auth && (
									<p className={cn(text.small, colors.text.muted)}>
										Requires authentication
									</p>
								)}
							</div>
						))}
					</div>

					<div className="border-gray-100 border-t pt-8">
						<p className={cn(text.base, colors.text.secondary)}>
							Full interactive documentation available at{" "}
							<a
								href="/api/docs"
								className={cn("underline", colors.text.primary)}
								target="_blank"
								rel="noopener noreferrer"
							>
								/api/docs
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
