import type { GalleryImageItem } from "../types";

interface ImageModalProps {
	selectedImage: GalleryImageItem;
	setSelectedImage: (image: GalleryImageItem | null) => void;
}

export function ImageModal({
	selectedImage,
	setSelectedImage,
}: ImageModalProps) {
	return (
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
	);
}
