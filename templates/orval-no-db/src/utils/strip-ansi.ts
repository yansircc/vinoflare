/**
 * Strip ANSI escape sequences from a string
 */
export function stripAnsi(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <ANSI codes contain control characters>
		/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
		"",
	);
}
