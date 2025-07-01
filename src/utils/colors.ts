/**
 * ANSI color codes for terminal output
 */
export const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",

	// Text colors
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	gray: "\x1b[90m",

	// Background colors
	bgRed: "\x1b[41m",
	bgGreen: "\x1b[42m",
	bgYellow: "\x1b[43m",
	bgBlue: "\x1b[44m",
	bgMagenta: "\x1b[45m",
	bgCyan: "\x1b[46m",
} as const;

/**
 * Colorize text for terminal output
 */
export function colorize(text: string, color: keyof typeof colors): string {
	return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Get color based on HTTP status code
 */
export function getStatusColor(status: number): keyof typeof colors {
	if (status >= 200 && status < 300) return "green";
	if (status >= 300 && status < 400) return "cyan";
	if (status >= 400 && status < 500) return "yellow";
	if (status >= 500) return "red";
	return "white";
}

/**
 * Colorize JSON for better readability
 */
export function colorizeJson(obj: any): string {
	const json = JSON.stringify(obj, null, 2);

	// Colorize different parts of JSON
	return (
		json
			// Keys in cyan
			.replace(/"([^"]+)":/g, `"${colors.cyan}$1${colors.reset}":`)
			// Strings in green
			.replace(/: "([^"]+)"/g, `: "${colors.green}$1${colors.reset}"`)
			// Numbers in yellow
			.replace(/: (\d+)/g, `: ${colors.yellow}$1${colors.reset}`)
			// Booleans in magenta
			.replace(/: (true|false)/g, `: ${colors.magenta}$1${colors.reset}`)
			// null/undefined in gray
			.replace(/: (null|undefined)/g, `: ${colors.gray}$1${colors.reset}`)
			// Type field in bright
			.replace(
				/"type": "([^"]+)"/g,
				`"${colors.cyan}type${colors.reset}": "${colors.bright}$1${colors.reset}"`,
			)
	);
}
