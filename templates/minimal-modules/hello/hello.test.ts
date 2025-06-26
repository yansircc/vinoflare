/**
 * @vitest-environment workers
 */
import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { describe, expect, it } from "vitest";
import { createHelloModule } from "./hello.routes";

// Create a new Hono app instance just for testing this module
const app = new Hono();
const helloModule = createHelloModule();
app.route("/hello", helloModule.getApp());

describe("Hello handlers", () => {
	describe("GET /hello", () => {
		it("should return hello message with timestamp", async () => {
			const response = await app.request("/hello");
			const json = await response.json() as { success: boolean; data: { message: string; time: string } };

			expect(response.status).toBe(StatusCodes.OK);
			expect(json.success).toBe(true);
			expect(json.data.message).toBe("Hello from API!");
			expect(json.data.time).toBeDefined();
			expect(new Date(json.data.time).getTime()).not.toBeNaN();
		});
	});
});