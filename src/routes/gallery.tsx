import { Explanation } from "@/components/Explanation";
import { PageHeader } from "@/components/PageHeader";
import {
	GalleryGrid,
	type GalleryImage,
	GalleryPagination,
	GalleryStats,
	GalleryUploadForm,
	ImageModal,
	useGalleryImages,
} from "@/hooks/gallery";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/gallery")({
	component: GalleryPage,
});

function GalleryPage() {
	const [showUploadForm, setShowUploadForm] = useState(false);
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

	// 用于获取分页信息的查询
	const { data: galleryResponse } = useGalleryImages({
		page: currentPage,
		limit: 12,
		sort: sortBy,
	});

	const pagination = galleryResponse?.pagination;

	const handleImageSelect = (image: GalleryImage) => {
		setSelectedImage(image);
	};

	const handleUploadSuccess = () => {
		setShowUploadForm(false);
		// 重置到第一页显示新图片
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="mx-auto max-w-6xl space-y-16">
			{/* 页面标题 */}
			<div className="flex flex-col items-center space-y-6">
				<PageHeader
					title="🖼️ 图片画廊"
					description={
						<p>
							展示你的精彩瞬间，基于{" "}
							<span className="font-bold">Cloudflare R2</span> 的图片存储服务
						</p>
					}
				/>

				{/* 操作按钮 */}

				<button
					type="button"
					onClick={() => setShowUploadForm(!showUploadForm)}
					className="inline-block rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-gray-700"
				>
					{showUploadForm ? "关闭上传" : "📷 上传图片"}
				</button>
			</div>

			{/* 上传表单 */}
			{showUploadForm && (
				<div className="space-y-4">
					<div className="text-center">
						<h2 className="font-medium text-gray-900 text-xl">上传新图片</h2>
						<p className="text-gray-500 text-sm">
							支持 JPEG、PNG、GIF、WebP 格式，最大 5MB
						</p>
					</div>
					<GalleryUploadForm
						onSuccess={handleUploadSuccess}
						onCancel={() => setShowUploadForm(false)}
					/>
				</div>
			)}

			{/* 图库统计 */}
			<div>
				<GalleryStats />
			</div>

			{/* 图片网格 */}
			<div className="space-y-6">
				<div className="text-center">
					<h2 className="font-medium text-gray-900 text-xl">图片展示</h2>
					<p className="text-gray-500 text-sm">点击图片查看详情</p>
				</div>
				<GalleryGrid
					onImageSelect={handleImageSelect}
					filters={{
						page: currentPage,
						limit: 12,
						sort: sortBy,
					}}
				/>
			</div>

			{/* 分页控件 */}
			{pagination && pagination.totalPages > 1 && (
				<GalleryPagination
					pagination={pagination}
					handlePageChange={handlePageChange}
				/>
			)}

			{/* 图片详情模态框 */}
			{selectedImage && (
				<ImageModal
					selectedImage={selectedImage}
					setSelectedImage={setSelectedImage}
				/>
			)}

			<Explanation
				title="技术栈"
				items={[
					{
						title: "图片存储",
						description: "基于 Cloudflare R2 的图片存储",
						color: "bg-blue-500",
					},
					{
						title: "路由",
						description: "基于 TanStack Router 的路由",
						color: "bg-green-500",
					},
					{
						title: "文件上传",
						description: "基于 Hono File 的文件上传",
						color: "bg-red-500",
					},
				]}
			/>
		</div>
	);
}
