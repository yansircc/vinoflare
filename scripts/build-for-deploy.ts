#!/usr/bin/env bun

import { $ } from "bun";

console.log("🏗️  准备构建和部署...\n");

const steps = [
	{
		name: "生成 Cloudflare 类型",
		action: async () => {
			console.log("📝 生成 Cloudflare 绑定类型...");
			await $`bun gen:types`;
		},
	},
	{
		name: "生成 API 客户端",
		action: async () => {
			console.log("🔧 生成 OpenAPI 规范和客户端代码...");
			await $`bun gen:api`;
		},
	},
	{
		name: "构建客户端资源",
		action: async () => {
			console.log("📦 构建客户端资源...");
			await $`vite build --mode client`;
		},
	},
];

async function runBuild() {
	try {
		for (const step of steps) {
			console.log(`\n${step.name}...`);
			await step.action();
		}

		console.log("\n✅ 构建完成！项目已准备好部署。");
	} catch (error) {
		console.error("\n❌ 构建过程中出现错误：", error);
		process.exit(1);
	}
}

runBuild();