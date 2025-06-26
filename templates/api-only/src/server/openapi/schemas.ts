// OpenAPI schema definitions - dynamically generated from Zod schemas
// All metadata is now defined in db/schemas.ts - true single source of truth!

import { z } from "zod/v4";
import {
	insertPostSchema,
	selectPostSchema,
	selectUserSchema,
} from "@/server/schemas";

// Generate OpenAPI schemas from Zod schemas
// Since we've moved all metadata to the schema definitions,
// we can now simply use toJSONSchema directly!
export const openAPISchemas = {
	// Post schemas - metadata comes from db/schemas.ts
	Post: z.toJSONSchema(selectPostSchema),
	InsertPost: z.toJSONSchema(insertPostSchema),

	// User schemas - metadata comes from db/schemas.ts
	User: z.toJSONSchema(selectUserSchema),
};
