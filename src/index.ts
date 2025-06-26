#!/usr/bin/env node

import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
	cancel,
	confirm,
	intro,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import fs from "fs-extra";
import kleur from "kleur";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect package manager
function detectPackageManager(): string {
	const userAgent = process.env.npm_config_user_agent || "";

	if (userAgent.includes("bun")) return "bun";
	if (userAgent.includes("yarn")) return "yarn";
	if (userAgent.includes("pnpm")) return "pnpm";
	return "npm";
}

// Get install command for package manager
function getInstallCommand(pm: string): string {
	return pm === "npm" ? "npm install" : `${pm} install`;
}

// Get run command for package manager
function getRunCommand(pm: string, script: string): string {
	return pm === "npm" ? `npm run ${script}` : `${pm} run ${script}`;
}

// Parse command line arguments
function parseArgs() {
	const args = process.argv.slice(2);
	const projectName = args.find((arg) => !arg.startsWith("--"));

	// Parse flags
	const flags = {
		noInstall: args.includes("--no-install"),
		noGit: args.includes("--no-git"),
		yes: args.includes("-y") || args.includes("--yes"),
		projectType: args.find((arg) => arg.startsWith("--type="))?.split("=")[1] as
			| "full-stack"
			| "api-only"
			| undefined,
		noDb: args.includes("--no-db"),
		noAuth: args.includes("--no-auth"),
		skipInit: args.includes("--skip-init"),
		packageManager: args
			.find((arg) => arg.startsWith("--pm="))
			?.split("=")[1] as string | undefined,
	};

	// Show help if requested
	if (args.includes("--help") || args.includes("-h")) {
		showHelp();
		process.exit(0);
	}

	return { projectName, flags };
}

// Show help message
function showHelp() {
	console.log(`
${kleur.bold("create-vino-app")} - Create modern full-stack applications

${kleur.dim("Usage:")}
  create-vino-app [project-name] [options]

${kleur.dim("Options:")}
  -y, --yes              Skip all prompts and use defaults
  --type=<type>          Project type: full-stack or api-only (default: full-stack)
  --no-db                Skip D1 Database
  --no-auth              Skip Better Auth (requires database)
  --no-install           Skip dependency installation
  --no-git               Skip git initialization
  --skip-init            Skip project initialization
  --pm=<pm>              Package manager: npm, yarn, pnpm, or bun
  -h, --help             Show this help message

${kleur.dim("Examples:")}
  # Interactive mode
  create-vino-app my-app

  # Non-interactive with defaults (full-stack with DB and auth)
  create-vino-app my-app -y

  # API-only without database
  create-vino-app my-api --type=api-only --no-db -y

  # Full-stack with DB but no auth
  create-vino-app my-app --no-auth -y
`);
}

// Files to remove for no-auth setup
const AUTH_FILES_TO_REMOVE = [
	"src/server/lib/auth.ts",
	"src/server/middleware/auth-guard.ts",
	"src/server/modules/auth",
	"src/server/db/tables/auth.ts",
	"src/server/schemas/database/auth.ts",
	"src/client/lib/auth.ts",
	"src/client/components/auth",
];

// Files to remove for no-db setup (includes auth files)
const DB_FILES_TO_REMOVE = [
	...AUTH_FILES_TO_REMOVE,
	"src/server/db",
	"src/server/middleware/database.ts",
	"src/server/schemas/database",
	"src/server/modules/posts", // Posts module depends on DB
	"drizzle.config.ts",
	"scripts/link-db.ts",
];

// Files specific to full-stack that should be removed in api-only
const FULLSTACK_ONLY_FILES = ["src/utils/manifest.ts"];

// Remove files from project
async function removeFiles(projectPath: string, files: string[]) {
	for (const file of files) {
		const fullPath = path.join(projectPath, file);
		if (await fs.pathExists(fullPath)) {
			await fs.remove(fullPath);
		}
	}
}

// Update package.json to remove dependencies and scripts
async function updatePackageJson(
	projectPath: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	const packageJsonPath = path.join(projectPath, "package.json");
	const packageJson = await fs.readJSON(packageJsonPath);

	// Remove dependencies
	if (!options.includeDb) {
		// Remove database-related dependencies
		delete packageJson.dependencies?.["drizzle-orm"];
		delete packageJson.dependencies?.["drizzle-zod"];
		delete packageJson.dependencies?.["better-auth"];
		delete packageJson.devDependencies?.["drizzle-kit"];
		delete packageJson.devDependencies?.["better-sqlite3"];

		// Remove database scripts
		const dbScripts = [
			"db:generate",
			"db:push:local",
			"db:push:remote",
			"db:studio",
			"db:reset:local",
			"db:reset:remote",
			"gen:module",
		];
		for (const script of dbScripts) {
			delete packageJson.scripts?.[script];
		}
	} else if (!options.includeAuth) {
		// Only remove auth dependency if we have DB but no auth
		delete packageJson.dependencies?.["better-auth"];
	}

	await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
}

// Update src/index.ts or src/index.tsx to remove auth middleware
async function updateIndexFile(
	projectPath: string,
	projectType: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	// Try both index.ts and index.tsx
	const indexPaths = [
		path.join(projectPath, "src/index.ts"),
		path.join(projectPath, "src/index.tsx"),
	];

	for (const indexPath of indexPaths) {
		if (!(await fs.pathExists(indexPath))) continue;

		let content = await fs.readFile(indexPath, "utf-8");

		if (!options.includeAuth) {
			// Remove auth imports and middleware
			content = content.replace(/import { authGuard } from.*\n/g, "");
			content = content.replace(/app\.use\("\/api\/\*", authGuard\);\n/g, "");
		}

		if (!options.includeDb) {
			// Additional cleanup for no-db scenario
			content = content.replace(/import { trimSlash } from.*\n/g, "");
			content = content.replace(/app\.use\(trimSlash\);\n/g, "");
		}

		await fs.writeFile(indexPath, content);
	}
}

// Update wrangler.toml to remove D1 configuration
async function updateWranglerToml(projectPath: string, includeDb: boolean) {
	if (includeDb) return;

	const wranglerPath = path.join(projectPath, "wrangler.toml");
	if (!(await fs.pathExists(wranglerPath))) return;

	let content = await fs.readFile(wranglerPath, "utf-8");

	// Remove D1 database configuration
	content = content.replace(/\[\[d1_databases\]\][\s\S]*?(?=\n\[|$)/g, "");

	await fs.writeFile(wranglerPath, content);
}

// Update api.ts to remove auth module imports
async function updateApiRoutes(
	projectPath: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	const apiPath = path.join(projectPath, "src/server/routes/api.ts");
	if (!(await fs.pathExists(apiPath))) return;

	let content = await fs.readFile(apiPath, "utf-8");

	if (!options.includeAuth) {
		// Remove auth module import
		content = content.replace(/import authModule from.*\n/g, "");
		// Remove auth module from modules array
		content = content.replace(/\s*authModule,?\n?/g, "");
	}

	if (!options.includeDb) {
		// Remove posts module import (it depends on database)
		content = content.replace(/import postsModule from.*\n/g, "");
		// Remove posts module from modules array
		content = content.replace(/\s*postsModule,?\n?/g, "");
		// Update BaseContext to BaseEnv for no-db scenario
		content = content.replace(
			/import type { BaseContext } from/g,
			"import type { BaseEnv } from",
		);
		content = content.replace(/new Hono<BaseContext>/g, "new Hono<BaseEnv>");
	}

	// Clean up modules array formatting
	content = content.replace(/const modules = \[\s*\]/g, "const modules = []");
	content = content.replace(/,(\s*)\]/g, "$1]");

	await fs.writeFile(apiPath, content);
}

// Update various files for no-auth scenario
async function updateNoAuthFiles(
	projectPath: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	if (options.includeAuth) return;

	// Update database schema index to remove auth imports
	if (options.includeDb) {
		const dbSchemaIndexPath = path.join(
			projectPath,
			"src/server/schemas/database/index.ts",
		);
		if (await fs.pathExists(dbSchemaIndexPath)) {
			let content = await fs.readFile(dbSchemaIndexPath, "utf-8");
			// Remove auth export block completely
			content = content.replace(
				/\/\/ Authentication schemas[\s\S]*?from "\.\/auth";\n\n/g,
				"",
			);
			await fs.writeFile(dbSchemaIndexPath, content);
		}

		// Update db/tables/index.ts to remove auth exports
		const dbTablesIndexPath = path.join(
			projectPath,
			"src/server/db/tables/index.ts",
		);
		if (await fs.pathExists(dbTablesIndexPath)) {
			let content = await fs.readFile(dbTablesIndexPath, "utf-8");
			content = content.replace(/export \* from "\.\/auth";\n/g, "");
			await fs.writeFile(dbTablesIndexPath, content);
		}
	}

	// Update middleware/index.ts to remove auth guard export
	const middlewareIndexPath = path.join(
		projectPath,
		"src/server/middleware/index.ts",
	);
	if (await fs.pathExists(middlewareIndexPath)) {
		let content = await fs.readFile(middlewareIndexPath, "utf-8");
		content = content.replace(/export { authGuard } from.*\n/g, "");
		await fs.writeFile(middlewareIndexPath, content);
	}

	// Update lib/types.ts for DB without auth scenario
	if (options.includeDb && !options.includeAuth) {
		const libTypesPath = path.join(projectPath, "src/server/lib/types.ts");
		if (await fs.pathExists(libTypesPath)) {
			const dbWithoutAuthTypes = `/// <reference path="../../../worker-configuration.d.ts" />

import type { Database } from "../db";

export interface BaseContext {
	Bindings: CloudflareBindings;
	Variables: {
		db: Database;
	};
}
`;
			await fs.writeFile(libTypesPath, dbWithoutAuthTypes);
		}
	}

	// Update openapi/schemas.ts to remove user schema references
	if (options.includeDb) {
		const openapiSchemasPath = path.join(
			projectPath,
			"src/server/openapi/schemas.ts",
		);
		if (await fs.pathExists(openapiSchemasPath)) {
			let content = await fs.readFile(openapiSchemasPath, "utf-8");
			// Remove user schema import
			content = content.replace(/,?\s*selectUserSchema/g, "");
			// Remove the entire User schema block including the empty toJSONSchema call
			content = content.replace(
				/,?\s*\/\/ User schemas[\s\S]*?User: z\.toJSONSchema\([^)]*\),?\s*/g,
				"",
			);
			// Clean up trailing commas
			content = content.replace(/,(\s*})/, "$1");
			await fs.writeFile(openapiSchemasPath, content);
		}

		// Update types/index.ts to remove auth-related types
		const typesIndexPath = path.join(projectPath, "src/server/types/index.ts");
		if (await fs.pathExists(typesIndexPath)) {
			let content = await fs.readFile(typesIndexPath, "utf-8");
			// Remove user type definitions and exports
			content = content.replace(/\/\/ User[\s\S]*?(?=\/\/|$)/g, "");
			content = content.replace(/\/\/ Session[\s\S]*?(?=\/\/|$)/g, "");
			// Remove auth-related types that reference removed types
			content = content.replace(/\/\/ Better Auth returns[\s\S]*?};\s*$/gm, "");
			// Remove any AuthUser or AuthSession type that references SelectUser/SelectSession
			content = content.replace(/export type AuthUser[\s\S]*?};\s*\n/g, "");
			content = content.replace(/export type AuthSession[\s\S]*?};\s*\n/g, "");
			// Clean up any trailing commas or empty lines
			content = content.replace(/,\s*\n\s*\n/g, "\n\n");
			await fs.writeFile(typesIndexPath, content);
		}
	}
}

// Update various files for no-db scenario
async function updateNoDbFiles(
	projectPath: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	if (options.includeDb) return;

	// Update lib/types.ts to remove Database type and auth types
	const typesPath = path.join(projectPath, "src/server/lib/types.ts");
	if (await fs.pathExists(typesPath)) {
		if (!options.includeAuth) {
			// For no-auth, create a minimal types file
			const minimalLibTypes = `import type { Context } from "hono";

interface Variables {
  // No database or auth in minimal setup
  [key: string]: unknown;
}

export interface Env {
  Bindings: CloudflareBindings;
  Variables: Variables;
}

export interface BaseEnv {
  Bindings: CloudflareBindings;
}

export type AppContext = Context<Env>;
export type BaseContext = BaseEnv;
`;
			await fs.writeFile(typesPath, minimalLibTypes);
		} else {
			// Just remove database references
			let content = await fs.readFile(typesPath, "utf-8");
			content = content.replace(/import type { Database } from.*\n/g, "");
			content = content.replace(/\s*db: Database;/g, "");
			await fs.writeFile(typesPath, content);
		}
	}

	// Update middleware/index.ts
	const middlewareIndexPath = path.join(
		projectPath,
		"src/server/middleware/index.ts",
	);
	if (await fs.pathExists(middlewareIndexPath)) {
		let content = await fs.readFile(middlewareIndexPath, "utf-8");
		content = content.replace(/export { authGuard } from.*\n/g, "");
		content = content.replace(/export { database } from.*\n/g, "");
		await fs.writeFile(middlewareIndexPath, content);
	}

	// Update schemas/index.ts
	const schemasIndexPath = path.join(
		projectPath,
		"src/server/schemas/index.ts",
	);
	if (await fs.pathExists(schemasIndexPath)) {
		let content = await fs.readFile(schemasIndexPath, "utf-8");
		content = content.replace(/export \* from.*database.*\n/g, "");
		await fs.writeFile(schemasIndexPath, content);
	}

	// Update types/index.ts
	const typesIndexPath = path.join(projectPath, "src/server/types/index.ts");
	if (await fs.pathExists(typesIndexPath)) {
		// For no-db, create a minimal types file
		const minimalTypes = `/**
 * Type definitions for the minimal API
 */

// Re-export common types
export * from "../lib/types";

// Example type for minimal API
export interface HealthCheck {
  status: "ok";
  timestamp: string;
}
`;
		await fs.writeFile(typesIndexPath, minimalTypes);
	}

	// Update openapi/schemas.ts
	const openapiSchemasPath = path.join(
		projectPath,
		"src/server/openapi/schemas.ts",
	);
	if (await fs.pathExists(openapiSchemasPath)) {
		const simpleSchemas = `import { z } from "zod/v4";

// Simple example schemas for minimal API
export const healthCheckSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
});

// Export for OpenAPI generation
export const openAPISchemas = {
  healthCheck: healthCheckSchema,
};
`;
		await fs.writeFile(openapiSchemasPath, simpleSchemas);
	}

	// Update worker-configuration.d.ts
	const workerConfigPath = path.join(projectPath, "worker-configuration.d.ts");
	if (await fs.pathExists(workerConfigPath)) {
		let content = await fs.readFile(workerConfigPath, "utf-8");
		content = content.replace(/\s*DB: D1Database;?\n/g, "\n");
		await fs.writeFile(workerConfigPath, content);
	}

	// For full-stack, update manifest.ts to remove ASSETS reference
	if (await fs.pathExists(path.join(projectPath, "src/utils/manifest.ts"))) {
		const manifestPath = path.join(projectPath, "src/utils/manifest.ts");
		let content = await fs.readFile(manifestPath, "utf-8");
		// Simple fix: comment out the ASSETS usage
		content = content.replace(
			/const manifestResponse = await c\.env\.ASSETS\.fetch\(/g,
			"// @ts-ignore - ASSETS not available in minimal setup\n  const manifestResponse = await c.env.ASSETS?.fetch(",
		);
		await fs.writeFile(manifestPath, content);
	}

	// Replace hello module with minimal version for no-db scenario
	const helloModulePath = path.join(projectPath, "src/server/modules/hello");
	if (await fs.pathExists(helloModulePath)) {
		// Remove existing hello module
		await fs.remove(helloModulePath);

		// Copy minimal hello module
		const minimalHelloPath = path.join(
			__dirname,
			"..",
			"templates",
			"minimal-modules",
			"hello",
		);
		await fs.copy(minimalHelloPath, helloModulePath);
	}
}

// Update routes config to remove auth routes
async function updateRoutesConfig(projectPath: string, includeAuth: boolean) {
	if (includeAuth) return;

	const routesConfigPath = path.join(
		projectPath,
		"src/server/config/routes.ts",
	);
	if (!(await fs.pathExists(routesConfigPath))) return;

	const simpleRoutesConfig = `/**
 * Route configuration file
 */

// Public API routes that don't require authentication
export const PUBLIC_API_ROUTES = [
  "/api/hello", // Test endpoint
  "/api/openapi.json", // OpenAPI documentation
  "/api/docs", // API documentation interface
  "/api/docs/*", // API documentation resources
  "/api/health", // Health check endpoint
  "/api/posts", // Posts are public in minimal setup
  "/api/posts/*", // Individual posts are public
] as const;

// Static resource paths
export const STATIC_ROUTES = [
  "/assets/*", // Frontend assets
  "/.vite/*", // Vite related files
  "/favicon.ico", // Site icon
] as const;
`;

	await fs.writeFile(routesConfigPath, simpleRoutesConfig);
}

// Create or update .dev.vars file based on features
async function createDevVarsFile(
	projectPath: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	const devVarsPath = path.join(projectPath, ".dev.vars");
	const devVarsExamplePath = path.join(projectPath, ".dev.vars.example");

	let content = "# Environment variables for local development\n";
	content += "ENVIRONMENT=development\n";

	if (options.includeAuth) {
		content += "\n# Better Auth Configuration\n";
		content += "BETTER_AUTH_SECRET=your-secret-key-here\n";
		content += "\n# OAuth Providers\n";
		content += "DISCORD_CLIENT_ID=your-discord-client-id\n";
		content += "DISCORD_CLIENT_SECRET=your-discord-client-secret\n";
	}

	// Only create .dev.vars if it doesn't exist
	if (!(await fs.pathExists(devVarsPath))) {
		await fs.writeFile(devVarsPath, content);
	}

	// Always update .dev.vars.example
	await fs.writeFile(devVarsExamplePath, content);
}

// Update client files that reference auth
async function updateClientAuthReferences(projectPath: string) {
	// Update __root.tsx
	const rootPath = path.join(projectPath, "src/client/routes/__root.tsx");
	if (await fs.pathExists(rootPath)) {
		let content = await fs.readFile(rootPath, "utf-8");
		// Remove UserMenu import and usage
		content = content.replace(/import { UserMenu } from.*\n/g, "");
		content = content.replace(/<UserMenu\s*\/>/g, "");
		await fs.writeFile(rootPath, content);
	}

	// Update router.tsx to remove auth routes
	const routerPath = path.join(projectPath, "src/client/router.tsx");
	if (await fs.pathExists(routerPath)) {
		let content = await fs.readFile(routerPath, "utf-8");
		// Remove login and profile route imports
		content = content.replace(
			/import\s+{\s*Route\s+as\s+LoginRoute\s*}\s+from.*login.*\n/g,
			"",
		);
		content = content.replace(
			/import\s+{\s*Route\s+as\s+ProfileRoute\s*}\s+from.*profile.*\n/g,
			"",
		);
		await fs.writeFile(routerPath, content);
	}
}

// Update client files for no-database scenario
async function updateClientForNoDb(projectPath: string) {
	// Remove posts-related components
	const postsFiles = [
		"src/client/components/posts-list.tsx",
		"src/client/components/post-form.tsx",
	];
	await removeFiles(projectPath, postsFiles);

	// Create HelloDemo component
	const helloDemoPath = path.join(
		projectPath,
		"src/client/components/hello-demo.tsx",
	);
	const helloDemoContent = `import { useGetHello } from "@/generated/endpoints/hello/hello";
import { cn, colors, text } from "@/client/lib/design";

export function HelloDemo() {
	const { data, isLoading, error } = useGetHello();

	if (isLoading) {
		return (
			<div className="space-y-4">
				<h2 className={cn(text.h2, "mb-2")}>API Demo</h2>
				<p className={cn(text.base, colors.text.secondary)}>Loading...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-4">
				<h2 className={cn(text.h2, "mb-2")}>API Demo</h2>
				<p className={cn(text.base, "text-red-600")}>Failed to load data</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className={cn(text.h2, "mb-2")}>API Demo</h2>
			<div className="space-y-2">
				<p className={cn(text.large)}>{data?.data?.message || "Hello from /api/hello"}</p>
				<p className={cn(text.small, colors.text.muted)}>
					{data?.data?.time
						? new Date(data.data.time).toLocaleString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
						  })
						: "No timestamp"}
				</p>
			</div>
		</div>
	);
}`;
	await fs.writeFile(helloDemoPath, helloDemoContent);

	// Update index.tsx to use HelloDemo instead of PostsList
	const indexRoutePath = path.join(projectPath, "src/client/routes/index.tsx");
	if (await fs.pathExists(indexRoutePath)) {
		let content = await fs.readFile(indexRoutePath, "utf-8");
		// Replace PostsList import with HelloDemo
		content = content.replace(
			/import { PostsList } from.*\n/g,
			'import { HelloDemo } from "@client/components/hello-demo";\n',
		);
		// Replace PostsList component with HelloDemo
		content = content.replace(/<PostsList\s*\/>/g, "<HelloDemo />");
		await fs.writeFile(indexRoutePath, content);
	}
}

// Process template based on options
async function processTemplate(
	projectPath: string,
	projectType: string,
	options: { includeDb: boolean; includeAuth: boolean },
) {
	// Remove files specific to project type
	if (projectType === "api-only") {
		await removeFiles(projectPath, FULLSTACK_ONLY_FILES);
	}

	// If everything is included, no more processing needed
	if (options.includeDb && options.includeAuth) return;

	const filesToRemove = options.includeDb
		? AUTH_FILES_TO_REMOVE
		: DB_FILES_TO_REMOVE;

	// Remove unnecessary files
	await removeFiles(projectPath, filesToRemove);

	// Update configurations
	await updatePackageJson(projectPath, options);
	await updateIndexFile(projectPath, projectType, options);
	await updateWranglerToml(projectPath, options.includeDb);
	await updateApiRoutes(projectPath, options);
	await updateNoAuthFiles(projectPath, options);
	await updateNoDbFiles(projectPath, options);
	await updateRoutesConfig(projectPath, options.includeAuth);
	await createDevVarsFile(projectPath, options);

	// Update other files based on project type
	if (projectType === "full-stack") {
		if (!options.includeAuth) {
			// Remove auth UI components and routes
			const clientAuthFiles = [
				"src/client/routes/login.tsx",
				"src/client/routes/profile.tsx",
			];
			await removeFiles(projectPath, clientAuthFiles);

			// Update client files that reference auth
			await updateClientAuthReferences(projectPath);
		}

		// Handle no-database scenario for client - will be done after init
		// if (!options.includeDb) {
		//   await updateClientForNoDb(projectPath);
		// }
	}
}

// Get initialization commands based on options
function getInitCommands(
	packageManager: string,
	projectType: string,
	options: { includeDb: boolean; includeAuth: boolean },
): string[] {
	const commands = [getRunCommand(packageManager, "gen:types")];

	if (projectType === "full-stack") {
		commands.push(getRunCommand(packageManager, "gen:routes"));
	}

	if (options.includeDb) {
		commands.push(getRunCommand(packageManager, "db:generate"));
		commands.push(getRunCommand(packageManager, "db:push:local"));
	}

	commands.push(getRunCommand(packageManager, "gen:api"));

	return commands;
}

// Configuration object to hold all user choices
interface ProjectConfig {
	projectName: string;
	projectType: "full-stack" | "api-only";
	includeDb: boolean;
	includeAuth: boolean;
	installDeps: boolean;
	initProject: boolean;
	initGit: boolean;
	packageManager: string;
	targetDir: string;
}

// Collect all user choices upfront
async function collectUserChoices(
	argProjectName: string | undefined,
	flags: any,
): Promise<ProjectConfig> {
	const packageManager = flags.packageManager || detectPackageManager();

	// Validate package manager
	if (
		flags.packageManager &&
		!["npm", "yarn", "pnpm", "bun"].includes(flags.packageManager)
	) {
		cancel(`Invalid package manager: ${flags.packageManager}`);
		process.exit(1);
	}

	// Get project name
	let projectName = argProjectName;
	if (!projectName && !flags.yes) {
		const name = await text({
			message: "Project name:",
			placeholder: "my-vino-app",
			validate: (value) => {
				if (!value) return "Project name is required";
				if (!/^[a-z0-9-_]+$/.test(value)) {
					return "Project name can only contain lowercase letters, numbers, hyphens and underscores";
				}
				return undefined;
			},
		});

		if (typeof name === "symbol") {
			cancel("Operation cancelled");
			process.exit(0);
		}
		projectName = name;
	} else if (!projectName && flags.yes) {
		cancel("Project name is required when using -y/--yes flag");
		process.exit(1);
	}

	// Ensure we have a project name at this point
	if (!projectName) {
		cancel("Project name is required");
		process.exit(1);
	}

	// Check if directory exists
	const targetDir = path.join(process.cwd(), projectName);
	if (fs.existsSync(targetDir)) {
		cancel(`Directory ${projectName} already exists`);
		process.exit(1);
	}

	// Get project type
	let projectType: "full-stack" | "api-only";
	if (flags.yes || flags.projectType) {
		projectType = flags.projectType || "full-stack";
		if (
			flags.projectType &&
			!["full-stack", "api-only"].includes(flags.projectType)
		) {
			cancel('Invalid project type. Use "full-stack" or "api-only"');
			process.exit(1);
		}
	} else {
		const typeChoice = (await select({
			message: "What type of project do you want to create?",
			options: [
				{
					value: "full-stack",
					label: "Full-stack app (Hono API + React frontend)",
				},
				{ value: "api-only", label: "API server only (Hono)" },
			],
		})) as "full-stack" | "api-only";

		if (typeof typeChoice === "symbol") {
			cancel("Operation cancelled");
			process.exit(0);
		}
		projectType = typeChoice;
	}

	// Get database option
	let includeDb: boolean;
	if (flags.yes && !flags.noDb) {
		includeDb = true;
	} else if (flags.noDb) {
		includeDb = false;
	} else {
		const dbChoice = await confirm({
			message: "Include D1 Database?",
			initialValue: true,
		});

		if (typeof dbChoice === "symbol") {
			cancel("Operation cancelled");
			process.exit(0);
		}
		includeDb = dbChoice;
	}

	// Get auth option
	let includeAuth = false;
	if (includeDb) {
		if (flags.yes && !flags.noAuth) {
			includeAuth = true;
		} else if (flags.noAuth) {
			includeAuth = false;
		} else {
			const authChoice = await confirm({
				message: "Include Better Auth authentication?",
				initialValue: true,
			});

			if (typeof authChoice === "symbol") {
				cancel("Operation cancelled");
				process.exit(0);
			}
			includeAuth = authChoice;
		}
	} else if (flags.noAuth === false && !includeDb) {
		console.log(
			kleur.yellow("⚠️  Better Auth requires a database. Skipping auth."),
		);
	}

	// Get install dependencies option
	let installDeps = true;
	if (flags.noInstall) {
		installDeps = false;
	} else if (!flags.yes) {
		const installChoice = await confirm({
			message: "Install dependencies?",
			initialValue: true,
		});

		if (typeof installChoice === "symbol") {
			installDeps = false;
		} else {
			installDeps = installChoice;
		}
	}

	// Get initialize project option (only if installing deps)
	let initProject = false;
	if (installDeps && !flags.skipInit) {
		if (flags.yes) {
			initProject = true;
		} else {
			const initMessage = includeDb
				? "Initialize project? (Generate types, routes, and setup database)"
				: "Initialize project? (Generate types and routes)";

			const initChoice = await confirm({
				message: initMessage,
				initialValue: true,
			});

			if (typeof initChoice !== "symbol") {
				initProject = initChoice;
			}
		}
	}

	// Get git initialization option
	let initGit = true;
	if (flags.noGit) {
		initGit = false;
	} else if (!flags.yes) {
		const gitChoice = await confirm({
			message: "Initialize git repository?",
			initialValue: true,
		});

		if (typeof gitChoice === "symbol") {
			initGit = false;
		} else {
			initGit = gitChoice;
		}
	}

	return {
		projectName,
		projectType,
		includeDb,
		includeAuth,
		installDeps,
		initProject,
		initGit,
		packageManager,
		targetDir,
	};
}

// Execute all actions based on collected choices
async function executeActions(config: ProjectConfig) {
	const s = spinner();
	s.start("Creating project...");

	try {
		// Create target directory
		await fs.ensureDir(config.targetDir);

		// Copy template
		const templateDir = path.join(
			__dirname,
			"..",
			"templates",
			config.projectType,
		);
		await fs.copy(templateDir, config.targetDir);

		// Process template based on options
		await processTemplate(config.targetDir, config.projectType, {
			includeDb: config.includeDb,
			includeAuth: config.includeAuth,
		});

		// Update package.json with project name
		const packageJsonPath = path.join(config.targetDir, "package.json");
		const packageJson = await fs.readJSON(packageJsonPath);
		packageJson.name = config.projectName;
		await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

		s.stop("Project created successfully!");

		// Change to project directory
		process.chdir(config.targetDir);

		// Install dependencies
		if (config.installDeps) {
			const installSpinner = spinner();
			installSpinner.start(
				`Installing dependencies with ${config.packageManager}...`,
			);

			try {
				await execAsync(getInstallCommand(config.packageManager));
				installSpinner.stop("Dependencies installed!");
			} catch (error: any) {
				installSpinner.stop("Failed to install dependencies");
				console.error(kleur.red("Error:"), error.message);
				config.initProject = false; // Don't init if deps failed
			}
		}

		// Initialize project
		if (config.initProject) {
			const initSpinner = spinner();
			initSpinner.start("Initializing project...");

			try {
				const commands = getInitCommands(
					config.packageManager,
					config.projectType,
					{
						includeDb: config.includeDb,
						includeAuth: config.includeAuth,
					},
				);

				// Run commands sequentially
				for (const cmd of commands) {
					await execAsync(cmd);
				}

				// For full-stack without DB, ensure client files are updated after API generation
				if (config.projectType === "full-stack" && !config.includeDb) {
					// Since we've already changed to project directory, use current directory
					await updateClientForNoDb(process.cwd());
				}

				initSpinner.stop("Project initialized!");
			} catch (error: any) {
				initSpinner.stop("Failed to initialize project");
				console.error(kleur.red("Error:"), error.message);
				console.log(
					kleur.yellow(
						"You can run the initialization commands manually later.",
					),
				);
			}
		}

		// Git initialization
		if (config.initGit) {
			const gitSpinner = spinner();
			gitSpinner.start("Initializing git repository...");

			try {
				// Initialize git
				await execAsync("git init");

				// Only format code if dependencies were installed
				if (config.installDeps) {
					await execAsync(getRunCommand(config.packageManager, "lint:fix"));
				}

				// Create initial commit
				await execAsync("git add -A");
				await execAsync('git commit -m "chore: initial commit"');

				gitSpinner.stop("Git repository initialized!");
			} catch (error: any) {
				gitSpinner.stop("Failed to initialize git");
				console.error(kleur.red("Error:"), error.message);
			}
		}

		// Success message
		const features = [];
		if (config.includeDb) features.push("D1 Database");
		if (config.includeAuth) features.push("Better Auth");
		const featuresText =
			features.length > 0
				? `\n${kleur.dim(`Features: ${features.join(", ")}`)}`
				: "";

		outro(`
${kleur.green("✓")} Project created at ${kleur.cyan(config.targetDir)}${featuresText}

Next steps:
  ${kleur.cyan(`cd ${config.projectName}`)}
  ${config.installDeps ? "" : `${kleur.cyan(getInstallCommand(config.packageManager))}\n  `}${kleur.cyan(getRunCommand(config.packageManager, "dev"))}

${kleur.dim("For more commands, check the README.md file.")}
`);
	} catch (error) {
		s.stop("Failed to create project");
		console.error(error);
		process.exit(1);
	}
}

async function main() {
	console.log();
	intro(kleur.bgCyan().black(" create-vino-app "));

	const { projectName: argProjectName, flags } = parseArgs();

	// Collect all user choices upfront
	const config = await collectUserChoices(argProjectName, flags);

	// Show configuration summary
	console.log();
	console.log(kleur.bold("Configuration Summary:"));
	console.log(kleur.dim("────────────────────────"));
	console.log(`  ${kleur.cyan("Project:")} ${config.projectName}`);
	console.log(`  ${kleur.cyan("Type:")} ${config.projectType}`);
	console.log(
		`  ${kleur.cyan("Database:")} ${config.includeDb ? "Yes" : "No"}`,
	);
	console.log(`  ${kleur.cyan("Auth:")} ${config.includeAuth ? "Yes" : "No"}`);
	console.log(
		`  ${kleur.cyan("Install dependencies:")} ${config.installDeps ? "Yes" : "No"}`,
	);
	console.log(
		`  ${kleur.cyan("Initialize project:")} ${config.initProject ? "Yes" : "No"}`,
	);
	console.log(
		`  ${kleur.cyan("Initialize git:")} ${config.initGit ? "Yes" : "No"}`,
	);
	console.log(`  ${kleur.cyan("Package Manager:")} ${config.packageManager}`);
	console.log();

	// Confirm before proceeding (unless using -y flag)
	if (!flags.yes) {
		const proceed = await confirm({
			message: "Proceed with the above configuration?",
			initialValue: true,
		});

		if (typeof proceed === "symbol" || !proceed) {
			cancel("Operation cancelled");
			process.exit(0);
		}
	}

	// Execute all actions
	await executeActions(config);
}

main().catch((error) => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
