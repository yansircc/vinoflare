export function KitchenHeader() {
	return (
		<div className="space-y-4 text-center">
			<h1 className="font-bold text-4xl text-gray-900">🍳 智能厨房</h1>
			<p className="text-gray-600 text-xl">
				体验 Cloudflare Queues 的<span className="font-bold">生产者</span>和
				<span className="font-bold">消费者</span>模式
			</p>
			<p className="text-gray-500 text-sm">
				每种食材都有不同的加工时长和失败率，失败后会自动重试
			</p>
		</div>
	);
}
