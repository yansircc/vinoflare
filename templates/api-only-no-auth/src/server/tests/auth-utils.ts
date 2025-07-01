/**
 * Generic authentication utilities for testing
 * Module-agnostic, can be used by any module
 */

export async function createAuthRequest(
	path: string,
	options: RequestInit = {},
): Promise<Request> {
	const headers = new Headers(options.headers);
	headers.set("Authorization", "Bearer test-token");

	if (options.body && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	return new Request(`http://localhost${path}`, {
		...options,
		headers,
	});
}
