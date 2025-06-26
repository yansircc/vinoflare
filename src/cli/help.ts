import kleur from "kleur";

/**
 * Display help information
 */
export function showHelp(): void {
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

/**
 * Display version information
 */
export function showVersion(): void {
	const { version } = require("../../package.json");
	console.log(`create-vino-app v${version}`);
}
