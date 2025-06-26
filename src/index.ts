#!/usr/bin/env node

import { intro, outro, text, select, spinner, cancel, confirm } from '@clack/prompts';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import kleur from 'kleur';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect package manager
function detectPackageManager(): string {
  const userAgent = process.env.npm_config_user_agent || '';
  
  if (userAgent.includes('bun')) return 'bun';
  if (userAgent.includes('yarn')) return 'yarn';
  if (userAgent.includes('pnpm')) return 'pnpm';
  return 'npm';
}

// Get install command for package manager
function getInstallCommand(pm: string): string {
  return pm === 'npm' ? 'npm install' : `${pm} install`;
}

// Get run command for package manager
function getRunCommand(pm: string, script: string): string {
  return pm === 'npm' ? `npm run ${script}` : `${pm} run ${script}`;
}

// Get execute command for package manager
function getExecCommand(pm: string, command: string): string {
  if (pm === 'bun') return `bun ${command}`;
  if (pm === 'pnpm') return `pnpm exec ${command}`;
  if (pm === 'yarn') return `yarn ${command}`;
  return `npx ${command}`;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const projectName = args.find(arg => !arg.startsWith('--'));
  const flags = {
    noInstall: args.includes('--no-install'),
    noGit: args.includes('--no-git'),
  };
  return { projectName, flags };
}

async function main() {
  console.log();
  intro(kleur.bgCyan().black(' create-vino-app '));

  const { projectName: argProjectName, flags } = parseArgs();
  const packageManager = detectPackageManager();

  // Get project name
  let projectName = argProjectName;
  if (!projectName) {
    const name = await text({
      message: 'Project name:',
      placeholder: 'my-vino-app',
      validate: (value) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/.test(value)) {
          return 'Project name can only contain lowercase letters, numbers, hyphens and underscores';
        }
        return undefined;
      }
    });

    if (typeof name === 'symbol') {
      cancel('Operation cancelled');
      process.exit(0);
    }
    projectName = name;
  }

  // Check if directory exists
  const targetDir = path.join(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    cancel(`Directory ${projectName} already exists`);
    process.exit(1);
  }

  // Ask project type
  const projectType = await select({
    message: 'What type of project do you want to create?',
    options: [
      { value: 'full-stack', label: 'Full-stack app (Hono API + React frontend)' },
      { value: 'api-only', label: 'API server only (Hono)' }
    ]
  });

  if (typeof projectType === 'symbol') {
    cancel('Operation cancelled');
    process.exit(0);
  }

  // Create project
  const s = spinner();
  s.start('Creating project...');

  try {
    // Create target directory
    await fs.ensureDir(targetDir);

    // Copy template
    const templateDir = path.join(__dirname, '..', 'templates', projectType);
    await fs.copy(templateDir, targetDir);

    // Update package.json with project name
    const packageJsonPath = path.join(targetDir, 'package.json');
    const packageJson = await fs.readJSON(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });

    s.stop('Project created successfully!');

    // Change to project directory
    process.chdir(targetDir);

    // Install dependencies
    if (!flags.noInstall) {
      const shouldInstall = await confirm({
        message: 'Install dependencies?',
        initialValue: true,
      });

      if (shouldInstall && typeof shouldInstall !== 'symbol') {
        const installSpinner = spinner();
        installSpinner.start(`Installing dependencies with ${packageManager}...`);
        
        try {
          await execAsync(getInstallCommand(packageManager));
          installSpinner.stop('Dependencies installed!');
        } catch (error) {
          installSpinner.stop('Failed to install dependencies');
          console.error(kleur.red('Error:'), error.message);
        }
      }
    }

    // Initialize project
    const shouldInitialize = await confirm({
      message: 'Initialize project? (Generate types, routes, and setup database)',
      initialValue: true,
    });

    if (shouldInitialize && typeof shouldInitialize !== 'symbol') {
      const initSpinner = spinner();
      initSpinner.start('Initializing project...');

      try {
        // Commands based on project type
        const commands = [
          getRunCommand(packageManager, 'gen:types'),
          getRunCommand(packageManager, 'db:generate'),
          getRunCommand(packageManager, 'db:push:local'),
        ];

        if (projectType === 'full-stack') {
          commands.push(getRunCommand(packageManager, 'gen:routes'));
        }

        commands.push(getRunCommand(packageManager, 'gen:api'));

        // Run commands sequentially
        for (const cmd of commands) {
          await execAsync(cmd);
        }

        initSpinner.stop('Project initialized!');
      } catch (error) {
        initSpinner.stop('Failed to initialize project');
        console.error(kleur.red('Error:'), error.message);
        console.log(kleur.yellow('You can run the initialization commands manually later.'));
      }
    }

    // Git initialization
    if (!flags.noGit) {
      const shouldInitGit = await confirm({
        message: 'Initialize git repository?',
        initialValue: true,
      });

      if (shouldInitGit && typeof shouldInitGit !== 'symbol') {
        const gitSpinner = spinner();
        gitSpinner.start('Initializing git repository...');

        try {
          // Initialize git
          await execAsync('git init');

          // Format code
          await execAsync(getRunCommand(packageManager, 'lint:fix'));

          // Create initial commit
          await execAsync('git add -A');
          await execAsync('git commit -m "chore: initial commit"');

          gitSpinner.stop('Git repository initialized!');
        } catch (error) {
          gitSpinner.stop('Failed to initialize git');
          console.error(kleur.red('Error:'), error.message);
        }
      }
    }

    // Success message
    outro(`
${kleur.green('✓')} Project created at ${kleur.cyan(targetDir)}

Next steps:
  ${kleur.cyan(`cd ${projectName}`)}
  ${kleur.cyan(getRunCommand(packageManager, 'dev'))}

${kleur.dim('For more commands, check the README.md file.')}
`);
  } catch (error) {
    s.stop('Failed to create project');
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});