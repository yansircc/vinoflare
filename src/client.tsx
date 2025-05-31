import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

// 导入 CSS 文件
import "./app.css";

import { Toaster } from "sonner";
import { isDev } from "./lib/env";
import { createQueryClient } from "./lib/query-client";
// 导入创建路由器的函数
import { createRouter } from "./router";

// 创建新的路由器实例，使用我们的配置
const router = createRouter();

// 注册路由器实例以确保类型安全
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	// 使用 useState 确保 QueryClient 实例在组件生命周期内保持稳定
	const [queryClient] = useState(() => createQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			<Toaster
				className="z-50"
				duration={2000}
				richColors
				position="top-center"
			/>
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
