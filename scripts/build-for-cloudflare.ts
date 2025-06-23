#!/usr/bin/env bun

import { $ } from "bun";

console.log("🏗️  准备 Cloudflare Workers 构建...\n");

const steps = [
	{
		name: "生成默认资源清单",
		action: async () => {
			console.log("📄 生成默认 assets-manifest.json...");
			await $`bun scripts/generate-default-manifest.ts`;
		},
	},
	{
		name: "生成 Cloudflare 类型",
		action: async () => {
			console.log("📝 生成 Cloudflare 绑定类型...");
			await $`wrangler types --env-interface CloudflareBindings`;
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
	for (const step of steps) {
		console.log(`\n${step.name}...`);
		try {
			await step.action();
		} catch (error) {
			console.error(`\n❌ 构建过程中出现错误：`, error);
			process.exit(1);
		}
	}
	console.log("\n✅ 构建完成！准备部署到 Cloudflare Workers...");
}

runBuild();
