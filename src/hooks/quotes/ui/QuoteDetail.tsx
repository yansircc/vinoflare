import { useQuote } from "@/hooks/quotes/api";
import { Link } from "@tanstack/react-router";

interface QuoteDetailProps {
	id: string;
}

export function QuoteDetail({ id }: QuoteDetailProps) {
	const { data: quote, isLoading, isError, error } = useQuote(id);

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

	if (!quote) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-gray-500">留言不存在</div>
			</div>
		);
	}

	const { name, email, message, createdAt } = quote.data;

	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-10 text-center font-light text-2xl text-gray-900">
				留言详情
			</h1>

			{/* 留言内容 */}
			<div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
				{/* 留言者信息 */}
				<div className="mb-6 border-gray-100 border-b pb-6">
					<div className="mb-2">
						<h2 className="font-semibold text-gray-900 text-xl">{name}</h2>
					</div>
					<div className="text-gray-600">{email}</div>
					<div className="mt-2 text-gray-400 text-sm">
						发表于{" "}
						{createdAt
							? new Date(createdAt).toLocaleString("zh-CN", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							: "未知时间"}
					</div>
				</div>

				{/* 留言内容 */}
				<div className="mb-6">
					<h3 className="mb-3 font-medium text-gray-900">留言内容</h3>
					<div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
						{message}
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex justify-end gap-3 pt-4">
					<Link
						to="/quotes"
						className="rounded-full border border-gray-300 px-6 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
					>
						返回列表
					</Link>
				</div>
			</div>

			{/* 相关信息 */}
			<div className="mt-8 text-center">
				<div className="text-gray-400 text-sm">留言 ID: {id}</div>
			</div>
		</div>
	);
}
