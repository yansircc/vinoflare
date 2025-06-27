import { hc } from "hono/client";

// We'll use a simple type assertion for now since AppType is complex
// In production, you might want to generate this from OpenAPI spec
export const api = hc("/");
