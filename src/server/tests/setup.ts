import { beforeAll, afterAll } from "vitest";

// Global test setup
beforeAll(async () => {
  console.log("🧪 Test environment initialized");
  // Any global setup needed before all tests
});

// Global test cleanup
afterAll(async () => {
  console.log("🧹 Test environment cleanup");
  // Any global cleanup needed after all tests
});