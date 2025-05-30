interface TaskProgressBarProps {
	progress: number;
	estimatedEndTime?: string;
}

export function TaskProgressBar({
	progress,
	estimatedEndTime,
}: TaskProgressBarProps) {
	const getProgressColor = (progress: number) => {
		if (progress === 100) {
			return "bg-gradient-to-r from-green-400 via-green-500 to-green-600";
		}
		if (progress < 30) {
			return "bg-gradient-to-r from-orange-400 to-orange-500";
		}
		if (progress < 70) {
			return "bg-gradient-to-r from-blue-500 to-blue-600";
		}
		return "bg-gradient-to-r from-green-500 to-green-600";
	};

	return (
		<div className="mt-2">
			<div className="mb-1 flex items-center justify-between">
				<span className="text-gray-600 text-xs">进度</span>
				<span className="text-gray-600 text-xs">{progress}%</span>
			</div>

			<div className="h-2 w-full rounded-full bg-gray-200">
				<div
					className={`h-2 rounded-full transition-all duration-1000 ease-out ${getProgressColor(progress)}`}
					style={{ width: `${progress}%` }}
				>
					<div
						className={`h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent ${
							progress === 100 ? "animate-bounce" : "animate-pulse"
						}`}
					/>
				</div>
			</div>

			{estimatedEndTime && (
				<div className="mt-1 text-green-600 text-xs">
					{progress === 100 ? (
						<span className="animate-pulse font-medium">🎯 即将完成...</span>
					) : (
						<span>
							⏱️ 预计完成: {new Date(estimatedEndTime).toLocaleTimeString()}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
