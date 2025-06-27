// OpenAPI schema definitions - database only (no auth)
import { insertPostSchema, selectPostSchema } from "@/server/schemas";
import { z } from "zod/v4";

// Generate OpenAPI schemas from Zod schemas
export const openAPISchemas = {
	// Post schemas - metadata comes from db/schemas.ts
	Post: z.toJSONSchema(selectPostSchema),
	InsertPost: z.toJSONSchema(insertPostSchema),
};