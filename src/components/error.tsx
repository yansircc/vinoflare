import type { ErrorComponentProps } from "@tanstack/react-router";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function ErrorBoundary({ error, reset }: ErrorComponentProps) {
	const isDev = import.meta.env.DEV;

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
			<div className="w-full max-w-2xl">
				<div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
					<div className="mb-6 flex items-center justify-center">
						<div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
							<AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
						</div>
					</div>

					<h1 className="mb-4 text-center font-bold text-3xl text-gray-900 dark:text-gray-100">
						出错了
					</h1>

					<p className="mb-8 text-center text-gray-600 dark:text-gray-400">
						抱歉，应用程序遇到了一个意外错误。请尝试刷新页面或返回首页。
					</p>

					{isDev && error && (
						<div className="mb-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-700">
							<h2 className="mb-2 font-semibold text-gray-700 text-sm dark:text-gray-300">
								错误详情（仅开发环境可见）
							</h2>
							<pre className="overflow-x-auto whitespace-pre-wrap text-gray-600 text-xs dark:text-gray-400">
								{error.message || "Unknown error"}
								{error.stack && (
									<>
										{"\n\n"}
										{error.stack}
									</>
								)}
							</pre>
						</div>
					)}

					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<button
							type="button"
							onClick={() => reset()}
							className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
						>
							<RefreshCw className="mr-2 h-5 w-5" />
							重试
						</button>

						<a
							href="/"
							className="inline-flex items-center justify-center rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
						>
							<Home className="mr-2 h-5 w-5" />
							返回首页
						</a>
					</div>
				</div>

				{!isDev && (
					<p className="mt-8 text-center text-gray-500 text-sm dark:text-gray-400">
						错误 ID: {new Date().getTime()}
					</p>
				)}
			</div>
		</div>
	);
}
