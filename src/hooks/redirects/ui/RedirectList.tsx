import {
	useDeleteRedirect,
	useRedirectStats,
	useRedirects,
} from "@/hooks/redirects/api";
import { RedirectForm } from "@/hooks/redirects/ui/RedirectForm";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface RedirectsListProps {
	initialPage?: number;
	initialSort?: "newest" | "oldest" | "visits";
}

export function RedirectsList({
	initialPage = 1,
	initialSort = "newest",
}: RedirectsListProps = {}) {
	const [showForm, setShowForm] = useState(false);
	const [currentPage, setCurrentPage] = useState(initialPage);
	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "visits">(
		initialSort,
	);

	// 使用 TanStack Query hooks
	const {
		data: RedirectsData,
		isLoading,
		isError,
		error,
	} = useRedirects({
		page: currentPage,
		limit: 6,
		sort: sortBy,
	});
	const { data: stats } = useRedirectStats();
	const deleteRedirectMutation = useDeleteRedirect();

	const Redirects = RedirectsData?.data || [];
	const pagination = RedirectsData?.pagination;

	const handleDeleteRedirect = async (id: string, shortCode: string) => {
		if (!confirm(`确定要删除短链接 ${shortCode} 吗？`)) return;

		try {
			await deleteRedirectMutation.mutateAsync(id);
		} catch (error) {
			console.error("Error deleting short link:", error);
		}
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		// 重置到第一页显示新短链接
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const copyToClipboard = async (shortUrl: string) => {
		try {
			await navigator.clipboard.writeText(shortUrl);
			// 这里可以添加toast提示
		} catch (error) {
			console.error("复制失败:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">加载中...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-red-500">
					加载失败: {error?.message || "未知错误"}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl">
			{/* 头部 */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-light text-2xl text-gray-900">短链接</h1>
					{stats && (
						<p className="mt-1 text-gray-500 text-sm">
							共 {stats.data.totalLinks} 个链接，总访问量{" "}
							{stats.data.totalVisits} 次
							{stats.data.todayVisits > 0 &&
								`，今日 ${stats.data.todayVisits} 次`}
						</p>
					)}
				</div>
				<div className="flex items-center gap-3">
					{/* 排序控制 */}
					<select
						value={sortBy}
						onChange={(e) => {
							setSortBy(e.target.value as "newest" | "oldest" | "visits");
							setCurrentPage(1);
						}}
						className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 text-sm transition-colors hover:bg-gray-50 focus:border-gray-900 focus:outline-none"
					>
						<option value="newest">最新优先</option>
						<option value="oldest">最旧优先</option>
						<option value="visits">访问量优先</option>
					</select>

					<button
						type="button"
						onClick={() => setShowForm(!showForm)}
						className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						{showForm ? "取消" : "创建短链接"}
					</button>
				</div>
			</div>

			{/* 统计信息 */}
			{stats && stats.data.topLinks.length > 0 && (
				<div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
					<h3 className="mb-3 font-medium text-gray-900 text-sm">热门链接</h3>
					<div className="space-y-2">
						{stats.data.topLinks.slice(0, 3).map(
							(link: {
								shortCode: string;
								originalUrl: string;
								visits: number;
							}) => (
								<div
									key={link.shortCode}
									className="flex items-center justify-between text-sm"
								>
									<div className="flex items-center gap-2">
										<span className="font-mono text-blue-600">
											{link.shortCode}
										</span>
										<span className="text-gray-500">→</span>
										<span className="max-w-xs truncate text-gray-700">
											{link.originalUrl}
										</span>
									</div>
									<span className="text-gray-500">{link.visits} 次访问</span>
								</div>
							),
						)}
					</div>
				</div>
			)}

			{/* 创建短链接表单 */}
			{showForm && (
				<div className="mb-8">
					<RedirectForm
						onSuccess={handleFormSuccess}
						onCancel={() => setShowForm(false)}
					/>
				</div>
			)}

			{/* 短链接列表 */}
			{Redirects.length === 0 ? (
				<div className="py-16 text-center">
					<div className="text-gray-400 text-lg">暂无短链接</div>
					<p className="mt-2 text-gray-500 text-sm">创建你的第一个短链接吧</p>
					<button
						type="button"
						onClick={() => setShowForm(true)}
						className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						创建短链接
					</button>
				</div>
			) : (
				<div className="space-y-6">
					{Redirects.map((Redirect: any) => (
						<div
							key={Redirect.id}
							className="group border-gray-100 border-b pb-6 last:border-b-0"
						>
							<div className="mb-3 flex items-start justify-between">
								<div className="flex-1">
									<div className="mb-2 flex items-center gap-3">
										<button
											type="button"
											onClick={() => copyToClipboard(Redirect.shortUrl)}
											className="cursor-pointer font-mono text-blue-600 text-xl transition-colors hover:text-blue-800"
											title="点击复制短链接"
										>
											{Redirect.shortCode}
										</button>
										<span className="text-gray-400">→</span>
									</div>
									<div className="break-all text-gray-600 text-sm">
										{Redirect.originalUrl}
									</div>
								</div>
								<div className="flex gap-1">
									<Link
										to="/redirects/$id"
										params={{ id: Redirect.id }}
										className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100"
									>
										查看
									</Link>
									<button
										type="button"
										className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
										onClick={() =>
											handleDeleteRedirect(Redirect.id, Redirect.shortCode)
										}
										disabled={deleteRedirectMutation.isPending}
									>
										删除
									</button>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="text-gray-400 text-xs">
									创建于{" "}
									{Redirect.createdAt
										? new Date(Redirect.createdAt).toLocaleString("zh-CN")
										: "未知时间"}
									{Redirect.updatedAt && (
										<>
											{" "}
											• 更新于{" "}
											{new Date(Redirect.updatedAt).toLocaleString("zh-CN")}
										</>
									)}
									{Redirect.createdBy && <> • 由 {Redirect.createdBy} 创建</>}
								</div>
								<div className="flex items-center gap-4 text-xs">
									<span className="text-gray-500">
										{Redirect.visits} 次访问
									</span>
									{Redirect.lastVisitedAt && (
										<span className="text-gray-400">
											最近访问：
											{new Date(Redirect.lastVisitedAt).toLocaleString("zh-CN")}
										</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 分页控制 */}
			{pagination && pagination.totalPages > 1 && (
				<div className="mt-12 flex items-center justify-center gap-6">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={!pagination.hasPrev}
							className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							← 上一页
						</button>

						<div className="flex items-center gap-1">
							{Array.from(
								{ length: pagination.totalPages },
								(_, i) => i + 1,
							).map((page) => (
								<button
									key={page}
									type="button"
									onClick={() => handlePageChange(page)}
									className={`px-3 py-1 text-sm transition-colors ${
										page === currentPage
											? "rounded-full bg-gray-900 text-white"
											: "rounded-full text-gray-700 hover:bg-gray-100"
									}`}
								>
									{page}
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={!pagination.hasNext}
							className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							下一页 →
						</button>
					</div>
				</div>
			)}

			{/* 页面信息 */}
			{pagination && (
				<div className="mt-6 text-center">
					<div className="text-gray-500 text-sm">
						第 {pagination.page} 页，共 {pagination.totalPages} 页 • 总共{" "}
						{pagination.totalCount} 个短链接
					</div>
				</div>
			)}
		</div>
	);
}
