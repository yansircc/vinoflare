#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { $ } from "bun";

interface EnvVars {
	[key: string]: string;
}

async function pushSecretsToGitHub() {
	console.log("🔐 准备推送环境变量到 GitHub Secrets...\n");

	// 检查是否有 gh CLI
	try {
		await $`gh --version`.quiet();
	} catch {
		console.error("❌ 未找到 GitHub CLI (gh)。请先安装：");
		console.error("   brew install gh");
		console.error("   或访问 https://cli.github.com/");
		process.exit(1);
	}

	// 检查是否已登录
	try {
		await $`gh auth status`.quiet();
	} catch {
		console.error("❌ 尚未登录 GitHub。请运行：");
		console.error("   gh auth login");
		process.exit(1);
	}

	// 读取环境变量文件
	const files = [
		{ path: ".dev.vars", label: "开发环境" },
		{ path: ".prod.vars", label: "生产环境" },
	];

	const allSecrets: EnvVars = {};

	for (const file of files) {
		if (existsSync(file.path)) {
			console.log(`📄 读取 ${file.label} 变量 (${file.path})`);
			const content = readFileSync(file.path, "utf-8");
			const lines = content.split("\n");

			for (const line of lines) {
				const trimmedLine = line.trim();
				if (trimmedLine && !trimmedLine.startsWith("#")) {
					const [key, ...valueParts] = trimmedLine.split("=");
					if (key) {
						const value = valueParts.join("=").replace(/^["']|["']$/g, "");
						allSecrets[key.trim()] = value;
					}
				}
			}
		}
	}

	// 添加 Cloudflare 相关的密钥
	const additionalSecrets = [
		{ key: "CLOUDFLARE_API_TOKEN", prompt: "请输入 Cloudflare API Token" },
		{ key: "CLOUDFLARE_ACCOUNT_ID", prompt: "请输入 Cloudflare Account ID" },
	];

	for (const secret of additionalSecrets) {
		if (!allSecrets[secret.key]) {
			console.log(`\n❓ ${secret.prompt}:`);
			const proc = Bun.spawn(["bash", "-c", "read -r value && echo $value"], {
				stdout: "pipe",
				stdin: "inherit",
			});
			const output = await new Response(proc.stdout).text();
			const value = output.trim();
			if (value) {
				allSecrets[secret.key] = value;
			}
		}
	}

	// 显示将要推送的密钥
	console.log("\n📋 将推送以下密钥到 GitHub Secrets:");
	for (const key of Object.keys(allSecrets)) {
		console.log(`   - ${key}`);
	}

	// 检查命令行参数是否包含 --yes
	const skipConfirmation = process.argv.includes("--yes");

	if (!skipConfirmation) {
		console.log("\n确认推送? (y/N): ");
		const proc = Bun.spawn(["bash", "-c", "read -r answer && echo $answer"], {
			stdout: "pipe",
			stdin: "inherit",
		});
		const output = await new Response(proc.stdout).text();
		const answer = output.trim().toLowerCase();

		if (answer !== "y" && answer !== "yes") {
			console.log("❌ 已取消");
			process.exit(0);
		}
	}

	// 推送密钥
	console.log("\n🚀 开始推送密钥...");
	let successCount = 0;
	let errorCount = 0;

	for (const [key, value] of Object.entries(allSecrets)) {
		try {
			// 使用 gh secret set 命令
			const proc = Bun.spawn(["gh", "secret", "set", key], {
				stdin: Buffer.from(value),
			});
			await proc.exited;

			if (proc.exitCode === 0) {
				console.log(`✅ ${key}`);
				successCount++;
			} else {
				console.error(`❌ ${key} - 推送失败`);
				errorCount++;
			}
		} catch (error) {
			console.error(`❌ ${key} - 错误: ${error}`);
			errorCount++;
		}
	}

	console.log(`\n📊 完成！成功: ${successCount}, 失败: ${errorCount}`);

	if (errorCount > 0) {
		process.exit(1);
	}
}

pushSecretsToGitHub().catch((error) => {
	console.error("❌ 发生错误:", error);
	process.exit(1);
});
