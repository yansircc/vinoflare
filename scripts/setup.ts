#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { $ } from "bun";

console.log("🚀 开始初始化 Vinoflare 项目...\n");

const steps = [
	{
		name: "检查环境配置",
		action: async () => {
			if (!existsSync(".dev.vars")) {
				console.log("📋 创建 .dev.vars 文件...");
				await $`cp .dev.vars.example .dev.vars`;
				console.log("⚠️  请编辑 .dev.vars 文件，添加必要的环境变量");
				console.log("   特别是 Discord OAuth 相关配置\n");
			} else {
				console.log("✅ .dev.vars 文件已存在");
			}
		},
	},
	{
		name: "生成数据库迁移",
		action: async () => {
			console.log("📊 生成数据库迁移文件...");
			await $`bun db:generate`;
		},
	},
	{
		name: "应用数据库迁移",
		action: async () => {
			console.log("🗄️  应用迁移到本地数据库...");
			await $`bun db:push:local`;
		},
	},
	{
		name: "生成 Cloudflare 类型",
		action: async () => {
			console.log("📝 生成 Cloudflare 绑定类型...");
			await $`bun gen:types`;
		},
	},
	{
		name: "生成默认资源清单",
		action: async () => {
			console.log("📦 生成默认 assets-manifest.json...");
			await $`bun scripts/generate-default-manifest.ts`;
		},
	},
	{
		name: "生成 API 客户端",
		action: async () => {
			console.log("🔧 生成 OpenAPI 规范和客户端代码...");
			await $`bun gen:api`;
		},
	},
];

async function runSetup() {
	try {
		for (const step of steps) {
			console.log(`\n${step.name}...`);
			await step.action();
		}

		console.log("\n✨ 初始化完成！");
		console.log("\n下一步：");
		console.log("1. 编辑 .dev.vars 文件（如果还未配置）");
		console.log("2. 运行 bun dev 启动开发服务器");
		console.log("\n🎉 祝您开发愉快！");
	} catch (error) {
		console.error("\n❌ 初始化过程中出现错误：", error);
		process.exit(1);
	}
}

runSetup();
