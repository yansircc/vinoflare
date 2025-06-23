#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import {
	cancel,
	confirm,
	intro,
	isCancel,
	log,
	outro,
	spinner,
	text,
} from "@clack/prompts";
import degit from "degit";
import kleur from "kleur";

const execAsync = promisify(spawn);

async function main() {
	// 检查是否是非交互式模式
	const args = process.argv.slice(2);
	const projectNameArg = args[0];
	const skipPrompts = args.includes("--yes") || args.includes("-y");

	console.log();
	intro(kleur.bgCyan().black(" create-vinoflare "));

	// 获取项目名称
	let projectName = projectNameArg;

	if (!projectName) {
		projectName = await text({
			message: "项目名称:",
			placeholder: "my-vinoflare-app",
			defaultValue: "my-vinoflare-app",
			validate: (value) => {
				if (!value) return "项目名称不能为空";
				if (!/^[a-z0-9-_]+$/.test(value)) {
					return "项目名称只能包含小写字母、数字、连字符和下划线";
				}
				if (existsSync(value)) {
					return `目录 ${value} 已存在`;
				}
			},
		});

		if (isCancel(projectName)) {
			cancel("已取消");
			process.exit(0);
		}
	} else {
		// 验证命令行参数中的项目名
		if (!/^[a-z0-9-_]+$/.test(projectName)) {
			log.error(kleur.red("项目名称只能包含小写字母、数字、连字符和下划线"));
			process.exit(1);
		}
		if (existsSync(projectName)) {
			log.error(kleur.red(`目录 ${projectName} 已存在`));
			process.exit(1);
		}
	}

	// 询问是否安装依赖
	const shouldInstall = skipPrompts
		? true
		: await confirm({
				message: "是否安装依赖?",
				initialValue: true,
			});

	if (!skipPrompts && isCancel(shouldInstall)) {
		cancel("已取消");
		process.exit(0);
	}

	// 询问是否初始化 git
	const shouldGitInit = skipPrompts
		? true
		: await confirm({
				message: "是否初始化 Git 仓库?",
				initialValue: true,
			});

	if (!skipPrompts && isCancel(shouldGitInit)) {
		cancel("已取消");
		process.exit(0);
	}

	// 询问是否运行 setup
	const shouldSetup = skipPrompts
		? true
		: await confirm({
				message: "是否运行初始化设置 (bun setup)?",
				initialValue: true,
			});

	if (!skipPrompts && isCancel(shouldSetup)) {
		cancel("已取消");
		process.exit(0);
	}

	// 开始创建项目
	const s = spinner();

	try {
		// 1. 克隆模板
		s.start("正在下载模板...");
		const emitter = degit("yansircc/vinoflare#main", {
			cache: false,
			force: true,
			verbose: false,
		});

		await emitter.clone(projectName as string);
		s.stop("模板下载完成");

		// 进入项目目录
		process.chdir(projectName as string);

		// 2. 初始化 git（如果需要）
		if (shouldGitInit) {
			s.start("初始化 Git 仓库...");
			await runCommand("git", ["init"]);
			await runCommand("git", ["add", "."]);
			await runCommand("git", [
				"commit",
				"-m",
				"chore: initial commit from create-vinoflare",
			]);
			s.stop("Git 仓库初始化完成");
		}

		// 3. 安装依赖（如果需要）
		if (shouldInstall) {
			s.start("安装依赖...");
			const packageManager = await detectPackageManager();
			await runCommand(packageManager, ["install"]);
			s.stop("依赖安装完成");
		}

		// 4. 运行 setup（如果需要）
		if (shouldSetup && shouldInstall) {
			s.start("运行初始化设置...");
			await runCommand("bun", ["setup"]);
			s.stop("初始化设置完成");
		}

		// 完成
		outro(kleur.green("✨ 项目创建成功!"));

		console.log();
		console.log(kleur.bold("  接下来:"));
		console.log();
		console.log(kleur.cyan(`  cd ${projectName}`));

		if (!shouldInstall) {
			console.log(kleur.cyan("  bun install"));
		}

		if (!shouldSetup) {
			console.log(kleur.cyan("  bun setup"));
		}

		console.log(kleur.cyan("  bun dev"));
		console.log();
		console.log(kleur.gray("  Happy coding! 🚀"));
		console.log();
	} catch (error) {
		s.stop("出错了");
		log.error(
			kleur.red(error instanceof Error ? error.message : String(error)),
		);
		process.exit(1);
	}
}

async function runCommand(command: string, args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			stdio: "inherit",
			shell: true,
		});

		child.on("close", (code) => {
			if (code !== 0) {
				reject(new Error(`命令失败: ${command} ${args.join(" ")}`));
			} else {
				resolve();
			}
		});

		child.on("error", reject);
	});
}

async function detectPackageManager(): Promise<string> {
	// 检查是否使用了特定的包管理器
	if (process.env.npm_config_user_agent) {
		if (process.env.npm_config_user_agent.includes("bun")) return "bun";
		if (process.env.npm_config_user_agent.includes("yarn")) return "yarn";
		if (process.env.npm_config_user_agent.includes("pnpm")) return "pnpm";
	}

	// 默认使用 bun
	return "bun";
}

main().catch((error) => {
	console.error("Unexpected error:", error);
	process.exit(1);
});
