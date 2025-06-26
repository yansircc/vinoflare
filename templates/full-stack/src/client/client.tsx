import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter } from "./router";
import "./app.css";

// 创建路由器实例
const router = createRouter();

// 注册路由器类型
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return <RouterProvider router={router} />;
}

// 客户端渲染
const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
