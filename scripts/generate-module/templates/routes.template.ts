import type { NameVariations } from "../utils";

export const getRoutesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { APIBuilder } from "@/server/lib/api-builder";
import { database } from "@/server/middleware/database";
import { insert${pascal}Schema, update${pascal}Schema } from "./${kebab}.schema";
import {
	getAll${pascal},
	get${pascal}ById,
	create${pascal},
	update${pascal},
	delete${pascal},
} from "./${kebab}.handlers";
import {
	getAll${pascal}OpenAPI,
	get${pascal}ByIdOpenAPI,
	create${pascal}OpenAPI,
	update${pascal}OpenAPI,
	delete${pascal}OpenAPI,
} from "./${kebab}.openapi";

export function create${pascal}Module() {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get all ${camel}
	builder.addRoute({
		method: "get",
		path: "/",
		handler: getAll${pascal},
		openapi: getAll${pascal}OpenAPI,
	});

	// Get ${camel} by ID
	builder.addRoute({
		method: "get",
		path: "/:id",
		handler: get${pascal}ById,
		openapi: get${pascal}ByIdOpenAPI,
	});

	// Create new ${camel}
	builder.addRoute({
		method: "post",
		path: "/",
		validation: {
			body: insert${pascal}Schema,
		},
		handler: create${pascal},
		openapi: create${pascal}OpenAPI,
	});

	// Update ${camel}
	builder.addRoute({
		method: "put",
		path: "/:id",
		validation: {
			body: update${pascal}Schema,
		},
		handler: update${pascal},
		openapi: update${pascal}OpenAPI,
	});

	// Delete ${camel}
	builder.addRoute({
		method: "delete",
		path: "/:id",
		handler: delete${pascal},
		openapi: delete${pascal}OpenAPI,
	});

	return builder;
}`;