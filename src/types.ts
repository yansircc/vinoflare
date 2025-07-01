export interface CLIOptions {
	name: string;
	type?: "full-stack" | "api-only";
	auth?: boolean;
	db?: boolean;
	yes?: boolean;
	install?: boolean;
	git?: boolean;
	packageManager?: string;
}

export interface ProjectConfig {
	name: string;
	type: "full-stack" | "api-only";
	auth: boolean;
	db: boolean;
	git: boolean;
	install: boolean;
	packageManager: PackageManager;
	yes?: boolean;
}

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export type BranchName =
	| "main"
	| "full-stack-no-auth"
	| "full-stack-no-auth-no-db"
	| "api-only"
	| "api-only-no-auth"
	| "api-only-no-auth-no-db";

export interface BranchMapping {
	type: "full-stack" | "api-only";
	auth: boolean;
	db: boolean;
	branch: BranchName;
}
