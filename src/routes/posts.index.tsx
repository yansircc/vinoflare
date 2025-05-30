import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PostForm } from "../components/PostForm";
import { useDeletePost, usePosts } from "../hooks/posts/posts-api";

export const Route = createFileRoute("/posts/")({
	component: PostsList,
});

function PostsList() {
	const [showForm, setShowForm] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

	// 使用 TanStack Query hooks
	const {
		data: postsData,
		isLoading,
		isError,
		error,
	} = usePosts({
		page: currentPage,
		limit: 6,
		sort: sortBy,
	});
	const deletePostMutation = useDeletePost();

	const posts = postsData?.data || [];
	const pagination = postsData?.pagination;

	const handleDeletePost = async (id: string, title: string) => {
		if (!confirm(`确定要删除文章《${title}》吗？`)) return;

		try {
			await deletePostMutation.mutateAsync(id);
		} catch (error) {
			console.error("Error deleting post:", error);
		}
	};

	const handleFormSuccess = () => {
		setShowForm(false);
		// 重置到第一页显示新文章
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
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
				<h1 className="font-light text-2xl text-gray-900">文章</h1>
				<div className="flex items-center gap-3">
					{/* 排序控制 */}
					<select
						value={sortBy}
						onChange={(e) => {
							setSortBy(e.target.value as "newest" | "oldest");
							setCurrentPage(1);
						}}
						className="rounded-full border border-gray-300 px-3 py-1 text-gray-700 text-sm transition-colors hover:bg-gray-50 focus:border-gray-900 focus:outline-none"
					>
						<option value="newest">最新优先</option>
						<option value="oldest">最旧优先</option>
					</select>

					<button
						type="button"
						onClick={() => setShowForm(!showForm)}
						className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						{showForm ? "取消" : "写文章"}
					</button>
				</div>
			</div>

			{/* 创建文章表单 */}
			{showForm && (
				<div className="mb-8">
					<PostForm
						onSuccess={handleFormSuccess}
						onCancel={() => setShowForm(false)}
					/>
				</div>
			)}

			{/* 文章列表 */}
			{posts.length === 0 ? (
				<div className="py-16 text-center">
					<div className="text-gray-400 text-lg">暂无文章</div>
					<p className="mt-2 text-gray-500 text-sm">成为第一个发布文章的人吧</p>
					<button
						type="button"
						onClick={() => setShowForm(true)}
						className="mt-4 rounded-full bg-gray-900 px-6 py-2 text-sm text-white transition-colors hover:bg-gray-700"
					>
						写文章
					</button>
				</div>
			) : (
				<div className="space-y-6">
					{posts.map((post: any) => (
						<div
							key={post.id}
							className="group border-gray-100 border-b pb-6 last:border-b-0"
						>
							<div className="mb-3 flex items-start justify-between">
								<div className="flex-1">
									<Link
										to="/posts/$id"
										params={{ id: post.id }}
										className="cursor-pointer font-medium text-gray-900 text-xl transition-colors hover:text-blue-600"
									>
										{post.title}
									</Link>
								</div>
								<div className="flex gap-1">
									<Link
										to="/posts/$id"
										params={{ id: post.id }}
										className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100"
									>
										查看
									</Link>
									<button
										type="button"
										className="rounded px-2 py-1 text-gray-400 text-xs opacity-0 transition-all hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
										onClick={() => handleDeletePost(post.id, post.title)}
										disabled={deletePostMutation.isPending}
									>
										删除
									</button>
								</div>
							</div>

							<div className="mb-3">
								<div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
									{post.content.length > 200
										? `${post.content.slice(0, 200)}...`
										: post.content}
								</div>
								{post.content.length > 200 && (
									<Link
										to="/posts/$id"
										params={{ id: post.id }}
										className="mt-1 text-blue-600 text-sm transition-colors hover:text-blue-800"
									>
										查看完整内容 →
									</Link>
								)}
							</div>

							<div className="text-gray-400 text-xs">
								发布于{" "}
								{post.createdAt
									? new Date(post.createdAt).toLocaleString("zh-CN")
									: "未知时间"}
								{post.updatedAt && (
									<>
										{" "}
										• 更新于 {new Date(post.updatedAt).toLocaleString("zh-CN")}
									</>
								)}
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
						{pagination.totalCount} 篇文章
					</div>
				</div>
			)}

			{/* 技术栈说明 */}
			<div className="mt-16 border-gray-100 border-t pt-8">
				<div className="text-center">
					<div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
						<svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
							<title>数据存储图标</title>
							<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
						</svg>
						<span>数据存储：Cloudflare KV</span>
					</div>
					<p className="mt-1 text-gray-400 text-xs">高性能边缘键值存储</p>
				</div>
			</div>
		</div>
	);
}
