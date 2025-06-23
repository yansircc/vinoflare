import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { BaseContext } from "@/server/lib/types";
import * as handlers from "./tasks.handlers";

// 使用标准 Hono 路由而非 OpenAPI，以提高类型推断性能
const app = new Hono<BaseContext>();

app.get("/tasks", async (c) => {
  const tasks = await handlers.list(c);
  return c.json(tasks);
});

app.post("/tasks", async (c) => {
  const body = await c.req.json();
  const result = await handlers.create(c, body);
  if (!result.success) {
    throw new HTTPException(422 as any, { message: "Validation error" });
  }
  return c.json(result.data);
});

app.get("/tasks/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"));
  if (Number.isNaN(id)) {
    throw new HTTPException(422 as any, { message: "Invalid ID" });
  }
  
  const task = await handlers.getOne(c, id);
  if (!task) {
    throw new HTTPException(404 as any, { message: "Task not found" });
  }
  return c.json(task);
});

app.patch("/tasks/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"));
  if (Number.isNaN(id)) {
    throw new HTTPException(422 as any, { message: "Invalid ID" });
  }
  
  const body = await c.req.json();
  const result = await handlers.patch(c, id, body);
  
  if (!result.success) {
    if (result.error === "not found") {
      throw new HTTPException(404 as any, { message: "Task not found" });
    }
    throw new HTTPException(422 as any, { message: "Validation error" });
  }
  
  return c.json(result.data);
});

app.delete("/tasks/:id", async (c) => {
  const id = Number.parseInt(c.req.param("id"));
  if (Number.isNaN(id)) {
    throw new HTTPException(422 as any, { message: "Invalid ID" });
  }
  
  const result = await handlers.remove(c, id);
  if (!result.success) {
    throw new HTTPException(404 as any, { message: "Task not found" });
  }
  
  return c.body(null, 204);
});

export default app;