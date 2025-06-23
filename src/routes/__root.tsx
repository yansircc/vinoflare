import { isDev } from "@/lib/env";
import NotFoundComponent from "@/ui/404";
import ErrorComponent from "@/ui/error";
import { Layout } from "@/ui/layout";
import { createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Vinoflare 全栈开发模板",
			},
			{
				name: "description",
				content: "基于 Hono + TanStack + Cloudflare 构建的现代全栈开发模板",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent,
});

function RootComponent() {
	return (
		<>
			<Layout />
			{isDev() && <TanStackRouterDevtools />}
		</>
	);
}
