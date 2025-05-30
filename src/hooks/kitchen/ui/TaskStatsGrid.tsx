interface TaskStatsGridProps {
	meta: {
		totalCount: number;
		processingCount: number;
		completedCount: number;
		failedCount: number;
	};
}

export function TaskStatsGrid({ meta }: TaskStatsGridProps) {
	return (
		<div className="mt-4 border-gray-200 border-t pt-4">
			<div className="grid grid-cols-4 gap-4 text-center">
				<div>
					<div className="font-medium text-gray-900">{meta.totalCount}</div>
					<div className="text-gray-500 text-xs">总任务</div>
				</div>
				<div>
					<div className="font-medium text-blue-600">
						{meta.processingCount}
					</div>
					<div className="text-gray-500 text-xs">进行中</div>
				</div>
				<div>
					<div className="font-medium text-green-600">
						{meta.completedCount}
					</div>
					<div className="text-gray-500 text-xs">已完成</div>
				</div>
				<div>
					<div className="font-medium text-red-600">{meta.failedCount}</div>
					<div className="text-gray-500 text-xs">失败</div>
				</div>
			</div>
		</div>
	);
}
