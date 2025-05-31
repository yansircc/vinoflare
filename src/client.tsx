import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// 导入 CSS 文件
import "./app.css";

import NotFoundComponent from "@/components/404";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { Toaster } from "sonner";
import { isDev } from "./lib/env";
import { queryClient } from "./lib/query-client";
// 导入生成的路由树
import { routeTree } from "./routeTree.gen";

// 创建路由器实例，包含所有配置
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultErrorComponent: DefaultCatchBoundary,
	defaultNotFoundComponent: () => <NotFoundComponent />,
	scrollRestoration: true,
});

// 注册路由器实例以确保类型安全
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<Toaster className="z-50" duration={2000} richColors />
			{isDev() && <ReactQueryDevtools initialIsOpen={false} />}
		</QueryClientProvider>
	);
}

// 渲染应用
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(React.createElement(StrictMode, null, React.createElement(App)));
}
