import { Link } from "@tanstack/react-router";

export default function NotFoundComponent() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4">
			<div className="w-full max-w-md text-center">
				{/* 404 图标/数字 */}
				<div className="mb-8">
					<div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
						<span className="font-bold text-6xl text-gray-400">404</span>
					</div>
				</div>

				{/* 错误信息 */}
				<div className="mb-8 space-y-3">
					<h1 className="font-medium text-2xl text-gray-900">页面未找到</h1>
					<p className="text-gray-600 text-sm leading-relaxed">
						抱歉，您访问的页面不存在或已被移除。
						<br />
						请检查网址是否正确，或返回首页继续浏览。
					</p>
				</div>

				{/* 操作按钮 */}
				<div className="space-y-3">
					<Link
						to="/"
						className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
					>
						返回首页
					</Link>

					<button
						type="button"
						onClick={() => window.history.back()}
						className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-700 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
					>
						返回上一页
					</button>
				</div>

				{/* 额外信息 */}
				<div className="mt-8 text-gray-400 text-xs">
					如果问题持续存在，请联系我们的技术支持
				</div>
			</div>
		</div>
	);
}
