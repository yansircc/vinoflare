import { createFileRoute } from "@tanstack/react-router";
import { layout, spacing } from "@/client/lib/design";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className={spacing.page}>
			<div className={layout.narrow}>
				<div className="space-y-8">
					<div className="text-center">
						<h1 className="font-bold text-4xl text-gray-900 tracking-tight dark:text-gray-100">
							Welcome to Vinoflare v2
						</h1>
						<p className="mt-4 text-gray-600 text-lg dark:text-gray-400">
							Full-stack TypeScript app on Cloudflare Workers with React and
							Hono. No authentication or database required.
						</p>
					</div>

					<div className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
						<h2 className="mb-4 font-semibold text-gray-900 text-xl dark:text-gray-100">
							Getting Started
						</h2>
						<ul className="space-y-2 text-gray-700 dark:text-gray-300">
							<li>
								• Run{" "}
								<code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-700">
									bun run dev
								</code>{" "}
								to start the development server
							</li>
							<li>
								• Run{" "}
								<code className="rounded bg-gray-200 px-2 py-1 text-sm dark:bg-gray-700">
									bun run gen:module &lt;name&gt;
								</code>{" "}
								to generate a new module
							</li>
							<li>
								• Check out the API documentation at{" "}
								<a
									href="/api/docs"
									className="text-blue-600 hover:underline dark:text-blue-400"
								>
									/api/docs
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
