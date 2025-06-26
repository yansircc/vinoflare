import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface ExecResult {
	stdout: string;
	stderr: string;
}

/**
 * Execute a command with proper error handling
 */
export async function execute(
	command: string,
	options?: { cwd?: string; silent?: boolean },
): Promise<ExecResult> {
	try {
		const result = await execAsync(command, {
			cwd: options?.cwd,
			env: process.env,
		});

		if (!options?.silent && result.stdout) {
			console.log(result.stdout);
		}

		return result;
	} catch (error: any) {
		throw new Error(`Command failed: ${command}\n${error.message}`);
	}
}

/**
 * Execute multiple commands in sequence
 */
export async function executeSequence(
	commands: string[],
	options?: { cwd?: string; silent?: boolean },
): Promise<void> {
	for (const command of commands) {
		await execute(command, options);
	}
}

/**
 * Check if a command exists
 */
export async function commandExists(command: string): Promise<boolean> {
	try {
		await execute(`which ${command}`, { silent: true });
		return true;
	} catch {
		return false;
	}
}
