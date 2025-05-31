import { useRedirect } from "@/hooks/redirects/api";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

interface RedirectsDetailProps {
	id: string;
}

export function RedirectsDetail({ id }: RedirectsDetailProps) {
	const { data: redirectResponse, isLoading, isError, error } = useRedirect(id);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("已复制到剪贴板！");
		} catch (error) {
			console.error("复制失败:", error);
			toast.error("复制失败，请手动复制");
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex items-center gap-3">
					<div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
					<div className="text-gray-500">加载中...</div>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-2 text-lg text-red-500">⚠️ 加载失败</div>
					<div className="text-gray-500">{error?.message || "未知错误"}</div>
					<Link
						to="/redirects"
						className="mt-4 inline-block rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						返回列表
					</Link>
				</div>
			</div>
		);
	}

	if (!redirectResponse) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mb-2 text-gray-400 text-lg">🔍 短链接不存在</div>
					<div className="text-gray-500">该短链接可能已被删除或不存在</div>
					<Link
						to="/redirects"
						className="mt-4 inline-block rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						返回列表
					</Link>
				</div>
			</div>
		);
	}

	const {
		shortCode,
		originalUrl,
		visits,
		createdAt,
		updatedAt,
		lastVisitedAt,
		createdBy,
		shortUrl,
	} = redirectResponse;

	return (
		<div className="mx-auto max-w-4xl space-y-8">
			{/* 页面标题 */}
			<div className="text-center">
				<h1 className="mb-2 font-light text-3xl text-gray-900">
					🔗 短链接详情
				</h1>
				<p className="text-gray-500">查看和管理您的短链接</p>
			</div>

			{/* 主要信息卡片 */}
			<div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
				{/* 短链接展示 */}
				<div className="mb-8 text-center">
					<div className="mb-4">
						<div className="mb-2 text-gray-600 text-sm">您的短链接</div>
						<div className="flex items-center justify-center gap-4">
							<code className="rounded-lg bg-blue-50 px-4 py-2 font-mono text-3xl text-blue-600">
								{shortCode}
							</code>
						</div>
						<div className="mt-3 break-all text-gray-500 text-sm">
							{shortUrl}
						</div>
					</div>

					{/* 操作按钮 */}
					<div className="flex justify-center gap-3">
						<button
							type="button"
							onClick={() => copyToClipboard(shortUrl)}
							className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2 text-sm text-white transition-colors hover:bg-blue-700"
						>
							📋 复制链接
						</button>
						<button
							type="button"
							onClick={() => window.open(shortUrl, "_blank")}
							className="flex items-center gap-2 rounded-full border border-green-300 px-6 py-2 text-green-700 text-sm transition-colors hover:bg-green-50"
						>
							🚀 测试访问
						</button>
					</div>
				</div>

				{/* 目标链接 */}
				<div className="mb-8 rounded-lg bg-gray-50 p-6">
					<h3 className="mb-3 font-medium text-gray-900">🎯 目标链接</h3>
					<div className="break-all rounded border bg-white p-3 text-gray-700">
						{originalUrl}
					</div>
				</div>

				{/* 统计信息 */}
				<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
					<div className="rounded-lg bg-blue-50 p-4 text-center">
						<div className="font-bold text-2xl text-blue-600">{visits}</div>
						<div className="text-blue-700 text-sm">总访问次数</div>
					</div>
					<div className="rounded-lg bg-green-50 p-4 text-center">
						<div className="font-medium text-green-600 text-lg">
							{createdAt
								? new Date(createdAt).toLocaleDateString("zh-CN")
								: "-"}
						</div>
						<div className="text-green-700 text-sm">创建日期</div>
					</div>
					<div className="rounded-lg bg-purple-50 p-4 text-center">
						<div className="font-medium text-lg text-purple-600">
							{lastVisitedAt
								? new Date(lastVisitedAt).toLocaleDateString("zh-CN")
								: "从未访问"}
						</div>
						<div className="text-purple-700 text-sm">最近访问</div>
					</div>
				</div>

				{/* 详细信息 */}
				<div className="border-gray-200 border-t pt-6">
					<h3 className="mb-4 font-medium text-gray-900">📊 详细信息</h3>
					<div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
						<div className="flex justify-between">
							<span className="text-gray-600">短链接 ID:</span>
							<span className="font-mono text-gray-900">{id}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">短码:</span>
							<span className="font-mono text-gray-900">{shortCode}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">创建时间:</span>
							<span className="text-gray-900">
								{createdAt
									? new Date(createdAt).toLocaleString("zh-CN")
									: "未知"}
							</span>
						</div>
						{updatedAt && updatedAt !== createdAt && (
							<div className="flex justify-between">
								<span className="text-gray-600">更新时间:</span>
								<span className="text-gray-900">
									{new Date(updatedAt).toLocaleString("zh-CN")}
								</span>
							</div>
						)}
						{createdBy && (
							<div className="flex justify-between">
								<span className="text-gray-600">创建者:</span>
								<span className="text-gray-900">{createdBy}</span>
							</div>
						)}
						{lastVisitedAt && (
							<div className="flex justify-between">
								<span className="text-gray-600">最后访问:</span>
								<span className="text-gray-900">
									{new Date(lastVisitedAt).toLocaleString("zh-CN")}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* 使用提示 */}
			<div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
				<h3 className="mb-3 font-medium text-blue-900">💡 使用提示</h3>
				<div className="space-y-2 text-blue-800 text-sm">
					<p>• 直接访问短链接会自动重定向到目标链接</p>
					<p>• 每次访问都会实时统计访问次数</p>
					<p>• 短链接采用 /s/ 前缀避免与页面路由冲突</p>
					<p>• 短链接数据存储在 Cloudflare KV 中，全球高速访问</p>
				</div>
			</div>

			{/* 底部操作 */}
			<div className="flex justify-center">
				<Link
					to="/redirects"
					className="rounded-full border border-gray-300 px-8 py-3 text-gray-700 transition-colors hover:bg-gray-50"
				>
					← 返回短链接列表
				</Link>
			</div>
		</div>
	);
}
