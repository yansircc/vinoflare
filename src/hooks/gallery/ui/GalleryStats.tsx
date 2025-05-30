import { useGalleryStats } from "../api";

export function GalleryStats() {
	const { data: response, isLoading, error } = useGalleryStats();

	const stats = response?.data;

	if (isLoading) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<h3 className="mb-4 font-medium text-gray-900 text-lg">图库统计</h3>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} className="text-center">
							<div className="mb-2 h-8 animate-pulse rounded bg-gray-200" />
							<div className="h-4 animate-pulse rounded bg-gray-200" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error || !stats) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<h3 className="mb-4 font-medium text-gray-900 text-lg">图库统计</h3>
				<p className="text-red-500 text-sm">加载统计信息失败</p>
			</div>
		);
	}

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (bytes / k ** i).toFixed(1) + " " + sizes[i];
	};

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-6">
			<h3 className="mb-4 font-medium text-gray-900 text-lg">图库统计</h3>

			<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div className="text-center">
					<div className="mb-1 font-bold text-2xl text-blue-600">
						{stats.total}
					</div>
					<div className="text-gray-500 text-sm">总图片数</div>
				</div>

				<div className="text-center">
					<div className="mb-1 font-bold text-2xl text-green-600">
						{stats.lastDay}
					</div>
					<div className="text-gray-500 text-sm">今日新增</div>
				</div>

				<div className="text-center">
					<div className="mb-1 font-bold text-2xl text-purple-600">
						{stats.lastWeek}
					</div>
					<div className="text-gray-500 text-sm">本周新增</div>
				</div>

				<div className="text-center">
					<div className="mb-1 font-bold text-2xl text-orange-600">
						{formatFileSize(stats.totalSize)}
					</div>
					<div className="text-gray-500 text-sm">总存储</div>
				</div>
			</div>

			<div className="border-gray-200 border-t pt-4">
				<div className="flex items-center justify-between text-gray-600 text-sm">
					<span>平均文件大小</span>
					<span className="font-medium">
						{formatFileSize(stats.averageSize)}
					</span>
				</div>
			</div>
		</div>
	);
}
