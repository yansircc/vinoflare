#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline";

interface EnvVars {
	[key: string]: string;
}

async function execCommand(
	command: string,
	args: string[] = [],
): Promise<{ success: boolean; output?: string }> {
	return new Promise((resolve) => {
		const proc = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
		let output = "";

		proc.stdout.on("data", (data) => {
			output += data.toString();
		});

		proc.on("close", (code) => {
			resolve({ success: code === 0, output });
		});

		proc.on("error", () => {
			resolve({ success: false });
		});
	});
}

async function readUserInput(prompt: string): Promise<string> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function setGitHubSecret(key: string, value: string): Promise<boolean> {
	return new Promise((resolve) => {
		const proc = spawn("gh", ["secret", "set", key], {
			stdio: ["pipe", "pipe", "pipe"],
		});

		proc.stdin.write(value);
		proc.stdin.end();

		proc.on("close", (code) => {
			resolve(code === 0);
		});

		proc.on("error", () => {
			resolve(false);
		});
	});
}

async function pushSecretsToGitHub() {
	console.log("🔐 准备推送环境变量到 GitHub Secrets...\n");

	// 检查是否有 gh CLI
	const ghVersionCheck = await execCommand("gh", ["--version"]);
	if (!ghVersionCheck.success) {
		console.error("❌ 未找到 GitHub CLI (gh)。请先安装：");
		console.error("   brew install gh");
		console.error("   或访问 https://cli.github.com/");
		process.exit(1);
	}

	// 检查是否已登录
	const ghAuthCheck = await execCommand("gh", ["auth", "status"]);
	if (!ghAuthCheck.success) {
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
		{ key: "CLOUDFLARE_API_TOKEN", prompt: "请输入 Cloudflare API Token: " },
		{ key: "CLOUDFLARE_ACCOUNT_ID", prompt: "请输入 Cloudflare Account ID: " },
	];

	for (const secret of additionalSecrets) {
		if (!allSecrets[secret.key]) {
			const value = await readUserInput(secret.prompt);
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
		const answer = await readUserInput("\n确认推送? (y/N): ");
		if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
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
			const success = await setGitHubSecret(key, value);
			if (success) {
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
