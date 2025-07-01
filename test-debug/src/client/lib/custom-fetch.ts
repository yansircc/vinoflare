/**
 * Custom fetch wrapper for Orval to handle API errors properly
 */

export interface ErrorResponse {
	error: {
		code: string;
		message: string;
		details?: unknown;
		timestamp: string;
		path?: string;
	};
}

export class APIError extends Error {
	constructor(
		public code: string,
		message: string,
		public status: number,
		public details?: unknown,
	) {
		super(message);
		this.name = "APIError";
	}
}

export async function customFetch<T>(
	url: string,
	options?: RequestInit,
): Promise<T> {
	const response = await fetch(url, options);

	// Handle 204 No Content and other empty responses
	if ([204, 205, 304].includes(response.status)) {
		return {} as T;
	}

	const text = await response.text();
	const data = text ? JSON.parse(text) : {};

	// Check if the response is not ok (status not in 200-299 range)
	if (!response.ok) {
		// Try to parse error response
		if (data?.error) {
			const errorData = data as ErrorResponse;
			throw new APIError(
				errorData.error.code,
				errorData.error.message,
				response.status,
				errorData.error.details,
			);
		}

		// Fallback error handling
		throw new APIError(
			"UNKNOWN_ERROR",
			`Request failed with status ${response.status}`,
			response.status,
			data,
		);
	}

	return { data, status: response.status, headers: response.headers } as T;
}
