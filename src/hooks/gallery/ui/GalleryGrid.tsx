import { useState } from "react";
import { getImageUrl, useDeleteGalleryImage, useGalleryImages } from "../api";
import type { GalleryImage } from "../types";

// 文件大小格式化函数
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Number.parseFloat((bytes / k ** i).toFixed(1)) + " " + sizes[i];
};

interface GalleryGridProps {
	onImageSelect?: (image: GalleryImage) => void;
	showActions?: boolean;
}

export function GalleryGrid({
	onImageSelect,
	showActions = true,
}: GalleryGridProps) {
	const { data: response, isLoading, error } = useGalleryImages();
	const deleteMutation = useDeleteGalleryImage();
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [hoveredImage, setHoveredImage] = useState<string | null>(null);

	const images = response?.data || [];

	const handleDelete = async (
		fileName: string,
		title: string,
		event: React.MouseEvent,
	) => {
		event.stopPropagation();
		if (window.confirm(`确定要删除图片"${title}"吗？`)) {
			setDeletingId(fileName);
			try {
				await deleteMutation.mutateAsync(fileName);
			} catch (error) {
				console.error("删除失败:", error);
			} finally {
				setDeletingId(null);
			}
		}
	};

	const handleImageClick = (image: GalleryImage) => {
		if (onImageSelect) {
			onImageSelect(image);
		}
	};

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, index) => (
					<div
						key={index}
						className="group relative overflow-hidden rounded-2xl bg-gray-100"
					>
						<div className="aspect-square">
							<div className="h-full w-full animate-pulse bg-gradient-to-br from-gray-200 to-gray-300" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="mb-4 rounded-full bg-red-50 p-4">
					<svg
						className="h-8 w-8 text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-label="错误图标"
					>
						<title>错误图标</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h3 className="font-medium text-gray-900 text-lg">加载失败</h3>
				<p className="mt-1 text-gray-500 text-sm">请检查网络连接后重试</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="mt-4 rounded-lg bg-gray-900 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-gray-700"
				>
					重新加载
				</button>
			</div>
		);
	}

	if (images.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="mb-6 rounded-full bg-gray-50 p-6">
					<svg
						className="h-12 w-12 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-label="图片图标"
					>
						<title>图片图标</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h3 className="font-medium text-gray-900 text-xl">还没有图片</h3>
				<p className="mt-2 text-gray-500 text-sm">
					上传你的第一张图片，开始构建美丽的画廊
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{images.map((image) => (
				<div
					key={image.fileName}
					className="group hover:-translate-y-1 relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-black/10 hover:shadow-xl"
					onMouseEnter={() => setHoveredImage(image.fileName)}
					onMouseLeave={() => setHoveredImage(null)}
				>
					<button
						className="aspect-square cursor-pointer overflow-hidden"
						onClick={() => handleImageClick(image)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								handleImageClick(image);
							}
						}}
						type="button"
					>
						<img
							src={image.imageUrl || getImageUrl(image.fileName)}
							alt={image.title}
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							loading="lazy"
						/>

						{/* Overlay gradient */}
						<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

						{/* Loading overlay for delete operation */}
						{deletingId === image.fileName && (
							<div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
								<div className="flex items-center space-x-2">
									<div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
									<span className="font-medium text-gray-900 text-sm">
										删除中...
									</span>
								</div>
							</div>
						)}
					</button>

					{/* Image info and actions */}
					<div
						className={`absolute right-0 bottom-0 left-0 p-4 transition-transform duration-300 ${
							hoveredImage === image.fileName
								? "translate-y-0"
								: "translate-y-full"
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="min-w-0 flex-1">
								<h4 className="truncate font-medium text-sm text-white drop-shadow-lg">
									{image.title}
								</h4>
								{image.description && (
									<p className="mt-1 truncate text-white/80 text-xs drop-shadow">
										{image.description}
									</p>
								)}
								<div className="mt-2 flex items-center space-x-3 text-white/70 text-xs">
									<span className="flex items-center space-x-1">
										<svg
											className="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<title>上传者</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										<span>{image.uploadedBy}</span>
									</span>
									<span className="flex items-center space-x-1">
										<svg
											className="h-3 w-3"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<title>文件大小</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
											/>
										</svg>
										<span>{formatFileSize(image.size)}</span>
									</span>
								</div>
							</div>

							{showActions && (
								<div className="ml-3 flex space-x-2">
									<button
										type="button"
										onClick={(e) =>
											handleDelete(image.fileName, image.title, e)
										}
										disabled={deletingId === image.fileName}
										className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80 disabled:cursor-not-allowed disabled:opacity-50"
										title="删除图片"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											aria-label="删除"
										>
											<title>删除</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
											/>
										</svg>
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Hover indicator */}
					<div
						className={`absolute top-3 right-3 transition-opacity duration-200 ${
							hoveredImage === image.fileName ? "opacity-100" : "opacity-0"
						}`}
					>
						<div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
							<svg
								className="h-4 w-4 text-white"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="查看"
							>
								<title>查看</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
								/>
							</svg>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
