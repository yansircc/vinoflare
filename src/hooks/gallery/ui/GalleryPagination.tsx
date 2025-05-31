import type { GetGalleryImagesResponse } from "../types";

interface GalleryPaginationProps {
	pagination: GetGalleryImagesResponse["pagination"];
	handlePageChange: (page: number) => void;
}

export function GalleryPagination({
	pagination,
	handlePageChange,
}: GalleryPaginationProps) {
	return (
		<div className="flex items-center justify-between">
			<div className="text-gray-500 text-sm">
				第 {pagination.page} 页，共 {pagination.totalPages} 页 • 总共{" "}
				{pagination.totalCount} 张图片
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => handlePageChange(pagination.page - 1)}
					disabled={!pagination.hasPrev}
					className="rounded border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
				>
					上一页
				</button>

				{/* 页码按钮 */}
				{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
					const pageNum =
						Math.max(
							1,
							Math.min(pagination.totalPages - 4, pagination.page - 2),
						) + i;

					if (pageNum > pagination.totalPages) return null;

					return (
						<button
							key={pageNum}
							type="button"
							onClick={() => handlePageChange(pageNum)}
							className={`rounded border px-3 py-1 text-sm transition-colors ${
								pageNum === pagination.page
									? "border-gray-900 bg-gray-900 text-white"
									: "border-gray-300 hover:bg-gray-50"
							}`}
						>
							{pageNum}
						</button>
					);
				})}

				<button
					type="button"
					onClick={() => handlePageChange(pagination.page + 1)}
					disabled={!pagination.hasNext}
					className="rounded border border-gray-300 px-3 py-1 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
				>
					下一页
				</button>
			</div>
		</div>
	);
}
