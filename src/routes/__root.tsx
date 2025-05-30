import NotFoundComponent from "@/components/404";
import { Layout } from "@/components/Layout";
import { isDev } from "@/lib/env";
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
				title: "留言板系统",
			},
			{
				name: "description",
				content: "基于 Hono + TanStack + Cloudflare 构建的现代留言板系统",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	return (
		<>
			<Layout />
			{isDev() && <TanStackRouterDevtools />}
		</>
	);
}
