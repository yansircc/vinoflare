import type { OpenAPIConfig } from "../core/openapi-generator";
import type { DocsConfig } from "../routes/docs";

export const API_CONFIG = {
	// Base API configuration
	basePath: "/api",
	version: "1.0.0",

	// OpenAPI specification configuration
	openapi: {
		title: "Vinoflare API",
		version: "1.0.0",
		description: "REST API for Vinoflare application",
		contact: {
			name: "API Support",
			email: "support@vinoflare.com",
		},
		servers: [
			{
				url: "/api",
				description: "API Server",
			},
		],
	} satisfies OpenAPIConfig,

	// Documentation UI configuration
	docs: {
		theme: "kepler" as const,
		layout: "modern" as const,
		defaultHttpClient: {
			targetKey: "js",
			clientKey: "fetch",
		},
	} satisfies DocsConfig,

	// Module loading configuration
	modules: {
		// Enable dynamic loading in the future
		dynamicLoading: false,
		// Module directory pattern
		pattern: "../modules/*/index.ts",
	},

	// Security configuration
	security: {
		// CORS settings
		cors: {
			origin: "*",
			credentials: true,
		},
		// Rate limiting
		rateLimit: {
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
		},
	},
} as const;
