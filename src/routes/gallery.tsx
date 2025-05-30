import {
	GalleryGrid,
	type GalleryImage,
	GalleryStats,
	GalleryUploadForm,
} from "@/hooks/gallery";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/gallery")({
	component: GalleryPage,
});

function GalleryPage() {
	const [showUploadForm, setShowUploadForm] = useState(false);
	const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

	const handleImageSelect = (image: GalleryImage) => {
		setSelectedImage(image);
	};

	const handleUploadSuccess = () => {
		setShowUploadForm(false);
	};

	return (
		<div className="mx-auto max-w-6xl space-y-16">
			{/* 页面标题 */}
			<div className="space-y-6">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-4xl text-gray-900">🖼️ 图片画廊</h1>
					<p className="text-gray-600 text-xl">
						展示你的精彩瞬间，基于{" "}
						<span className="font-bold">Cloudflare R2</span> 的图片存储服务
					</p>
				</div>

				{/* 操作按钮 */}
				<div className="flex items-center justify-center gap-4">
					<button
						type="button"
						onClick={() => setShowUploadForm(!showUploadForm)}
						className="inline-block rounded-full bg-gray-900 px-8 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-gray-700"
					>
						{showUploadForm ? "关闭上传" : "📷 上传图片"}
					</button>
				</div>
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
				<GalleryGrid onImageSelect={handleImageSelect} />
			</div>

			{/* 图片详情模态框 */}
			{selectedImage && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
					<div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white">
						{/* 关闭按钮 */}
						<button
							type="button"
							onClick={() => setSelectedImage(null)}
							className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>关闭</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>

						{/* 图片 */}
						<img
							src={`/api/gallery/${selectedImage.fileName}/image`}
							alt={selectedImage.title}
							className="h-auto max-h-[70vh] w-auto max-w-full object-contain"
						/>

						{/* 图片信息 */}
						<div className="p-6">
							<div className="space-y-3">
								<div>
									<h3 className="font-medium text-gray-900 text-lg">
										{selectedImage.title}
									</h3>
									{selectedImage.description && (
										<p className="text-gray-600 text-sm">
											{selectedImage.description}
										</p>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4 border-gray-200 border-t pt-3 text-sm">
									<div>
										<span className="text-gray-500">上传者:</span>
										<span className="ml-2 text-gray-900">
											{selectedImage.uploadedBy}
										</span>
									</div>
									<div>
										<span className="text-gray-500">上传时间:</span>
										<span className="ml-2 text-gray-900">
											{new Date(selectedImage.uploaded).toLocaleDateString()}
										</span>
									</div>
									<div>
										<span className="text-gray-500">文件大小:</span>
										<span className="ml-2 text-gray-900">
											{(selectedImage.size / 1024 / 1024).toFixed(2)} MB
										</span>
									</div>
									<div>
										<span className="text-gray-500">文件名:</span>
										<span className="ml-2 text-gray-900">
											{selectedImage.fileName}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 技术说明 */}
			<div className="grid gap-8 md:grid-cols-2">
				{/* 存储技术 */}
				<div className="rounded-lg border border-gray-200 p-6">
					<h2 className="mb-4 font-medium text-gray-900 text-xl">存储技术</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-orange-500" />
							<span className="text-gray-700">
								Cloudflare R2 - 对象存储服务
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<span className="text-gray-700">自定义元数据 - 图片信息存储</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-green-500" />
							<span className="text-gray-700">边缘分发 - 全球加速访问</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-purple-500" />
							<span className="text-gray-700">无服务器 - 按需扩容</span>
						</div>
					</div>
				</div>

				{/* 功能特性 */}
				<div className="rounded-lg border border-gray-200 p-6">
					<h2 className="mb-4 font-medium text-gray-900 text-xl">功能特性</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-cyan-500" />
							<span className="text-gray-700">
								多格式支持 - JPEG/PNG/GIF/WebP
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-amber-500" />
							<span className="text-gray-700">文件大小限制 - 最大 5MB</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-red-500" />
							<span className="text-gray-700">
								实时统计 - 上传数量和存储大小
							</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="h-2 w-2 rounded-full bg-indigo-500" />
							<span className="text-gray-700">响应式设计 - 适配各种设备</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
