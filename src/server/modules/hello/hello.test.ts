/**
 * @vitest-environment workers
 */

import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp } from "@/server/tests/test-helpers";
import helloModule from "./index";
import { type HelloResponse } from "./hello.schema";

describe("Hello Module", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeAll(() => {
    app = createTestApp([helloModule]);
  });

  describe("GET /api/hello", () => {
    it("should return a greeting message with timestamp", async () => {
      const response = await app.request("/api/hello", {}, {});
      
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
      
      const json = await response.json() as HelloResponse;
      
      // Validate response structure
      expect(json).toHaveProperty("message");
      expect(json).toHaveProperty("time");
      expect(json.message).toBe("Hello from API!");
      
      // Validate timestamp is a valid ISO string
      const timestamp = new Date(json.time);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
      
      // Timestamp should be recent (within 1 second)
      const now = Date.now();
      const timeDiff = Math.abs(timestamp.getTime() - now);
      expect(timeDiff).toBeLessThan(1000);
    }); 
  });
});