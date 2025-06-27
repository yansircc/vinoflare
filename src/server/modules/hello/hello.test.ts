/**
 * @vitest-environment workers
 */

import { describe, expect, it } from "vitest";
import app from "../../../index";

// Define the expected shape of the response body
interface HelloResponseBody {
	success: boolean;
	data: {
		message: string;
		time: string;
	};
}

describe("Hello Route", () => {
	it("should return a valid JSON response from /api/hello", async () => {
		const res = await app.request("/api/hello");
		expect(res.status).toBe(200);

		// Assert the type of the parsed JSON body
		const body = (await res.json()) as HelloResponseBody;
		expect(body.success).toBe(true);
		expect(body.data).toHaveProperty("message");
		expect(body.data.message).toBe("Hello from API!");
		expect(body.data).toHaveProperty("time");
	});
});
