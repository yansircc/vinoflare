import type { NameVariations } from "../utils";

export const getRoutesTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `import { StatusCodes } from "http-status-codes";
import { APIBuilder } from "@/server/core/api-builder";
import { database } from "@/server/middleware/database";
import {
	getAll${pascal},
	get${pascal}ById,
	create${pascal},
	update${pascal},
	delete${pascal},
} from "./${kebab}.handlers";
import {
	insert${pascal}Schema,
	update${pascal}Schema,
	${camel}IdSchema,
	${camel}ResponseSchema,
	${camel}ListResponseSchema,
	${camel}DeleteResponseSchema,
} from "./${kebab}.schema";

export const create${pascal}Module = () => {
	const builder = new APIBuilder({
		middleware: [database()],
	});

	// Get all ${camel}
	builder
		.get("/", getAll${pascal})
		.summary("Get all ${camel}")
		.description("Retrieves a list of all ${camel}")
		.tags("${pascal}")
		.security([{ bearerAuth: [] }])
		.response(StatusCodes.OK, {
			description: "${pascal} list retrieved successfully",
			schema: ${camel}ListResponseSchema,
		});

	// Get ${camel} by ID
	builder
		.get("/:id", get${pascal}ById)
		.summary("Get ${camel} by ID")
		.description("Retrieves a specific ${camel} by its ID")
		.tags("${pascal}")
		.security([{ bearerAuth: [] }])
		.params({ id: ${camel}IdSchema })
		.response(StatusCodes.OK, {
			description: "${pascal} retrieved successfully",
			schema: ${camel}ResponseSchema,
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "${pascal} not found",
		});

	// Create new ${camel}
	builder
		.post("/", create${pascal})
		.summary("Create new ${camel}")
		.description("Creates a new ${camel} with the provided data")
		.tags("${pascal}")
		.security([{ bearerAuth: [] }])
		.body(insert${pascal}Schema)
		.response(StatusCodes.CREATED, {
			description: "${pascal} created successfully",
			schema: ${camel}ResponseSchema,
		})
		.response(StatusCodes.BAD_REQUEST, {
			description: "Invalid request data",
		});

	// Update ${camel}
	builder
		.put("/:id", update${pascal})
		.summary("Update ${camel}")
		.description("Updates an existing ${camel}")
		.tags("${pascal}")
		.security([{ bearerAuth: [] }])
		.params({ id: ${camel}IdSchema })
		.body(update${pascal}Schema)
		.response(StatusCodes.OK, {
			description: "${pascal} updated successfully",
			schema: ${camel}ResponseSchema,
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "${pascal} not found",
		});

	// Delete ${camel}
	builder
		.delete("/:id", delete${pascal})
		.summary("Delete ${camel}")
		.description("Deletes a ${camel} by ID")
		.tags("${pascal}")
		.security([{ bearerAuth: [] }])
		.params({ id: ${camel}IdSchema })
		.response(StatusCodes.OK, {
			description: "${pascal} deleted successfully",
			schema: ${camel}DeleteResponseSchema,
		})
		.response(StatusCodes.NOT_FOUND, {
			description: "${pascal} not found",
		});

	return builder;
}`;