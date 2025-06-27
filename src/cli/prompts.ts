import { confirm, select, text } from "@clack/prompts";
import type { CommandFlags } from "../types";

/**
 * Interactive prompts for project configuration
 */
export class InteractivePrompts {
	constructor(private flags: CommandFlags) {}

	async getProjectName(initial?: string): Promise<string | symbol> {
		if (initial || this.flags.yes) {
			return initial || "my-vinoflare";
		}

		return text({
			message: "Project name:",
			placeholder: "my-vinoflare",
			validate: (value) => {
				if (!value) return "Project name is required";
				if (!/^[a-z0-9-_]+$/.test(value)) {
					return "Project name can only contain lowercase letters, numbers, hyphens and underscores";
				}
				return undefined;
			},
		});
	}

	async getProjectType(): Promise<"full-stack" | "api-only" | symbol> {
		if (this.flags.yes || this.flags.projectType) {
			return this.flags.projectType || "full-stack";
		}

		return select({
			message: "What type of project do you want to create?",
			options: [
				{
					value: "full-stack",
					label: "Full-stack app (Hono API + React frontend)",
				},
				{ value: "api-only", label: "API server only (Hono)" },
			],
		});
	}

	async getDatabaseOption(): Promise<boolean | symbol> {
		if (this.flags.yes && !this.flags.noDb) {
			return true;
		}
		if (this.flags.noDb) {
			return false;
		}

		return confirm({
			message: "Include D1 Database?",
			initialValue: true,
		});
	}

	async getAuthOption(hasDatabase: boolean): Promise<boolean | symbol> {
		if (!hasDatabase) {
			return false;
		}

		if (this.flags.yes && !this.flags.noAuth) {
			return true;
		}
		if (this.flags.noAuth) {
			return false;
		}

		return confirm({
			message: "Include Better Auth authentication?",
			initialValue: true,
		});
	}

	async getInstallOption(): Promise<boolean | symbol> {
		if (this.flags.noInstall) {
			return false;
		}
		if (this.flags.yes) {
			return true;
		}

		return confirm({
			message: "Install dependencies?",
			initialValue: true,
		});
	}

	async getGitOption(): Promise<boolean | symbol> {
		if (this.flags.noGit) {
			return false;
		}
		if (this.flags.yes) {
			return true;
		}

		return confirm({
			message: "Initialize git repository?",
			initialValue: true,
		});
	}

	async getInitOption(hasDatabase: boolean): Promise<boolean | symbol> {
		if (this.flags.skipInit) {
			return false;
		}
		if (this.flags.yes) {
			return true;
		}

		const message = hasDatabase
			? "Initialize project? (Generate types, routes, and setup database)"
			: "Initialize project? (Generate types and routes)";

		return confirm({
			message,
			initialValue: true,
		});
	}
}
