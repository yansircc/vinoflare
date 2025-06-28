/**
 * @vitest-environment workers
 */

import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { helloHandler } from "./hello.handlers";
import type { HelloResponse } from "./hello.schema";

const app = new Hono();
app.get("/api/hello", helloHandler);

describe("Hello Route", () => {
	it("should return a valid JSON response from /api/hello", async () => {
		const res = await app.request("/api/hello");
		expect(res.status).toBe(200);

		// Assert the type of the parsed JSON body
		const body = (await res.json()) as HelloResponse;
		expect(body.message).toBe("Hello from API!");
		expect(body.time).toBeDefined();
	});
});
