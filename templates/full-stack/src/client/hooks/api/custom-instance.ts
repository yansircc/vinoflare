import type { AxiosError, AxiosRequestConfig } from "axios";

export interface ErrorType<Error> extends AxiosError<Error> {}

// Custom instance for Orval that:
// 1. Uses fetch (compatible with Cloudflare Workers)
// 2. Mimics axios interface for Orval compatibility
// 3. Automatically prefixes URLs with /api
export const customInstance = async <T>(
	config: AxiosRequestConfig,
): Promise<T> => {
	const { url, method = "GET", params, data, headers, signal } = config;

	// Ensure url is provided
	if (!url) {
		throw new Error("URL is required for API request");
	}

	// Build the full URL with query parameters
	// Add /api prefix if not already present
	const apiUrl = url.startsWith("/api") ? url : `/api${url}`;
	const requestUrl = new URL(apiUrl, window.location.origin);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				requestUrl.searchParams.append(key, String(value));
			}
		});
	}

	// Prepare fetch options
	const fetchOptions: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/json",
			...(headers as Record<string, string>),
		},
		signal: signal as AbortSignal | undefined,
	};

	// Add body for non-GET requests
	if (data && method !== "GET") {
		fetchOptions.body = JSON.stringify(data);
	}

	try {
		const response = await fetch(requestUrl.toString(), fetchOptions);

		if (!response.ok) {
			const error = {
				response: {
					data: await response.json().catch(() => ({})),
					status: response.status,
					statusText: response.statusText,
				},
				config,
				message: `Request failed with status ${response.status}`,
			} as AxiosError;

			throw error;
		}

		// Handle empty responses
		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			return {} as T;
		}

		return await response.json();
	} catch (error) {
		// Re-throw axios-like errors
		if ((error as any).response) {
			throw error;
		}

		// Convert network errors to axios format
		throw {
			response: undefined,
			config,
			message: (error as Error).message || "Network error",
		} as AxiosError;
	}
};
