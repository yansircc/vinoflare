import type { NameVariations } from "../utils";

export const getTestTemplate = ({
	pascal,
	camel,
	kebab,
}: NameVariations) => `/**
 * @vitest-environment workers
 */
import { describe, it } from "vitest";

describe("${pascal} Module", () => {
	it.skip("should be implemented", () => {
		// TODO: Implement tests following the project's testing pattern
		// See posts.test.ts for reference
	});
	
	// Example test structure:
	// describe("GET /${kebab}", () => {
	//   it("should return all ${camel}", async () => {
	//     // Test implementation
	//   });
	// });
	
	// describe("POST /${kebab}", () => {
	//   it("should create a new ${camel}", async () => {
	//     // Test implementation
	//   });
	// });
});`;