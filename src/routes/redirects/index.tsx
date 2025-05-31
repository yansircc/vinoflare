import { Explanation } from "@/components/Explanation";
import { PageHeader } from "@/components/PageHeader";
import { RedirectsList } from "@/hooks/redirects/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/redirects/")({
	component: RedirectsPage,
});

function RedirectsPage() {
	return (
		<div className="mx-auto max-w-6xl space-y-12">
			<PageHeader
				title="🔗 短链接管理"
				description={
					<>
						<p>
							创建和管理您的 <span className="font-bold">短链接</span>
						</p>
						<p>将长 URL 转换为简短易分享的链接，支持访问统计和自定义代码</p>
					</>
				}
			/>

			<RedirectsList />

			<Explanation
				title="💡 功能特性"
				items={[
					{
						title: "边缘存储",
						description: "基于 Cloudflare KV 的全球分布式存储",
						color: "bg-purple-500",
					},
					{
						title: "智能短码",
						description: "支持自定义短码或自动生成，避免重复",
						color: "bg-blue-500",
					},
					{
						title: "无冲突路由",
						description: "使用 /s/ 前缀避免与页面路由冲突",
						color: "bg-orange-500",
					},
				]}
			/>
		</div>
	);
}
