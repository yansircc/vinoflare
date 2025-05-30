export function WorkflowExplanation() {
	return (
		<div className="rounded-lg bg-gray-50 p-6">
			<h3 className="mb-3 font-medium text-gray-900">💡 工作原理</h3>
			<div className="grid gap-4 md:grid-cols-3">
				<div className="flex gap-3">
					<div className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
					<div>
						<div className="font-medium text-gray-700 text-sm">生产者</div>
						<div className="text-gray-600 text-xs">
							用户选择食材，API 将任务发送到队列
						</div>
					</div>
				</div>
				<div className="flex gap-3">
					<div className="mt-2 h-2 w-2 rounded-full bg-green-500" />
					<div>
						<div className="font-medium text-gray-700 text-sm">队列处理</div>
						<div className="text-gray-600 text-xs">
							Cloudflare Queues 异步处理任务
						</div>
					</div>
				</div>
				<div className="flex gap-3">
					<div className="mt-2 h-2 w-2 rounded-full bg-purple-500" />
					<div>
						<div className="font-medium text-gray-700 text-sm">消费者</div>
						<div className="text-gray-600 text-xs">
							Worker 消费队列，更新进度和状态
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
