import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	return (
		<div className="mx-auto max-w-4xl space-y-16">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-4xl text-gray-900">
						VinoFlare 全栈开发模板
					</h1>
					<p className="text-gray-600 text-xl">
						<span className="font-bold">Vi</span>te + Ho
						<span className="font-bold">no</span> + Cloud
						<span className="font-bold">flare</span>，一个完整的全栈开发解决方案
					</p>
				</div>

			{/* 技术栈展示 */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* 前端技术 */}
				<div className="rounded-lg border border-gray-200 p-6">
					<h2 className="mb-4 font-medium text-gray-900 text-xl">前端技术</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span className="text-gray-700">
								TanStack Query - 强大的数据获取和状态管理
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span className="text-gray-700">
								TanStack Router - 类型安全的路由系统
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-purple-500" />
							<span className="text-gray-700">Tanstack Form - 现代表单库</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-cyan-500" />
							<span className="text-gray-700">
								Tailwind CSS - 原子化 CSS 框架
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-amber-500" />
							<span className="text-gray-700">Vite - 快速构建工具</span>
						</div>
					</div>
				</div>

				{/* 后端技术 */}
				<div className="rounded-lg border border-gray-200 p-6">
					<h2 className="mb-4 font-medium text-gray-900 text-xl">后端技术</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-orange-500" />
							<span className="text-gray-700">Hono - 轻量级 Web 框架</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-red-500" />
							<span className="text-gray-700">
								Drizzle ORM - 现代 TypeScript ORM
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-yellow-500" />
							<span className="text-gray-700">Cloudflare D1 - 边缘数据库</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-indigo-500" />
							<span className="text-gray-700">Better Auth - 认证</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-teal-500" />
							<span className="text-gray-700">
								Cloudflare Workers - 边缘计算
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* 健康检查 */}
			<div className="grid gap-4 sm:grid-cols-3">
				<a
					href="/health"
					target="_blank"
					rel="noopener noreferrer"
					className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center transition-colors hover:bg-gray-50"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
						<svg
							className="h-4 w-4 text-green-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>健康检查图标</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<div>
						<div className="font-medium text-gray-900 text-sm">健康检查</div>
						<div className="text-gray-500 text-xs">/health</div>
					</div>
				</a>

				<a
					href="/api"
					target="_blank"
					rel="noopener noreferrer"
					className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center transition-colors hover:bg-gray-50"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
						<svg
							className="h-4 w-4 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>API信息图标</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<div>
						<div className="font-medium text-gray-900 text-sm">API 信息</div>
						<div className="text-gray-500 text-xs">/api</div>
					</div>
				</a>

				<a
					href="/api/auth/get-session"
					target="_blank"
					rel="noopener noreferrer"
					className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-4 text-center transition-colors hover:bg-gray-50"
				>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
						<svg
							className="h-4 w-4 text-purple-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>认证状态图标</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<div>
						<div className="font-medium text-gray-900 text-sm">认证状态</div>
						<div className="text-gray-500 text-xs">/api/auth/get-session</div>
					</div>
				</a>
			</div>
		</div>
	);
}
