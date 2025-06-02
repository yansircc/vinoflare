import { env } from "cloudflare:test";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import type { Task } from "../../db/schema";
import { createTestApp } from "../../lib/create-app";
import router from "./tasks.index";

// 创建测试应用
const app = createTestApp(router);

interface ErrorResponse {
  success: boolean;
  error?: any;
  message?: string;
}

describe("Tasks API", () => {
  beforeAll(async () => {
    // 创建表结构，匹配schema.ts中的定义
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();
  });

  beforeEach(async () => {
    // 清理测试数据
    await env.DB.prepare("DELETE FROM tasks").run();
  });

  describe("POST /tasks", () => {
    it("验证必填字段", async () => {
      const res = await app.request("/tasks", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ done: false }),
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("成功创建任务", async () => {
      const taskData = {
        name: "Learn advanced testing",
        done: false,
      };
      
      const res = await app.request("/tasks", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(taskData),
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.OK);
      const task = await res.json() as Task;
      expect(task.name).toBe(taskData.name);
      expect(task.done).toBe(taskData.done);
      expect(task.id).toBeDefined();
    });

    it("验证名称约束", async () => {
      // 测试名称过长
      const longName = "a".repeat(256);
      const res1 = await app.request("/tasks", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name: longName, done: false }),
      }, env);
      
      expect(res1.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);

      // 测试名称为空
      const res2 = await app.request("/tasks", {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name: "", done: false }),
      }, env);
      
      expect(res2.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });
  });

  describe("GET /tasks", () => {
    it("获取所有任务列表", async () => {
      // 先创建一个任务
      await env.DB.prepare(
        "INSERT INTO tasks (name, done, created_at, updated_at) VALUES (?, ?, ?, ?)"
      ).bind("Test Task", 0, Date.now(), Date.now()).run();

      const res = await app.request("/tasks", {}, env);
      
      expect(res.status).toBe(HttpStatusCodes.OK);
      const tasks = await res.json() as Task[];
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBeGreaterThan(0);
    });
  });

  describe("GET /tasks/:id", () => {
    it("获取特定任务", async () => {
      // 先创建一个任务
      const result = await env.DB.prepare(
        "INSERT INTO tasks (name, done, created_at, updated_at) VALUES (?, ?, ?, ?)"
      ).bind("Test Task", 0, Date.now(), Date.now()).run();

      const taskId = result.meta.last_row_id;
      const res = await app.request(`/tasks/${taskId}`, {}, env);
      
      expect(res.status).toBe(HttpStatusCodes.OK);
      const task = await res.json() as Task;
      expect(task.name).toBe("Test Task");
    });

    it("获取不存在的任务返回404", async () => {
      const res = await app.request("/tasks/99999", {}, env);
      
      expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
      const data = await res.json() as ErrorResponse;
      expect(data.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });
  });

  describe("PATCH /tasks/:id", () => {
    it("验证空更新", async () => {
      const res = await app.request("/tasks/1", {
        method: "PATCH",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({}),
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.UNPROCESSABLE_ENTITY);
    });

    it("成功更新任务", async () => {
      // 先创建一个任务
      const result = await env.DB.prepare(
        "INSERT INTO tasks (name, done, created_at, updated_at) VALUES (?, ?, ?, ?)"
      ).bind("Test Task", 0, Date.now(), Date.now()).run();

      const taskId = result.meta.last_row_id;
      const updates = { name: "Updated Task", done: true };

      const res = await app.request(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(updates),
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.OK);
      const task = await res.json() as Task;
      expect(task.name).toBe("Updated Task");
      expect(task.done).toBe(true);
    });

    it("更新不存在的任务返回404", async () => {
      const res = await app.request("/tasks/99999", {
        method: "PATCH",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({ name: "test" }),
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
    });
  });

  describe("DELETE /tasks/:id", () => {
    it("成功删除任务", async () => {
      // 先创建一个任务
      const result = await env.DB.prepare(
        "INSERT INTO tasks (name, done, created_at, updated_at) VALUES (?, ?, ?, ?)"
      ).bind("Test Task", 0, Date.now(), Date.now()).run();

      const taskId = result.meta.last_row_id;
      const res = await app.request(`/tasks/${taskId}`, {
        method: "DELETE",
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.NO_CONTENT);
    });

    it("删除不存在的任务返回404", async () => {
      const res = await app.request("/tasks/99999", {
        method: "DELETE",
      }, env);
      
      expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
      const data = await res.json() as ErrorResponse;
      expect(data.message).toBe(HttpStatusPhrases.NOT_FOUND);
    });
  });

  describe("直接测试数据库操作", () => {
    it("可以直接测试D1数据库", async () => {
      // 直接使用env.DB进行数据库操作
      const result = await env.DB.prepare(
        "INSERT INTO tasks (name, done, created_at, updated_at) VALUES (?, ?, ?, ?)"
      ).bind("Direct DB test", 0, Date.now(), Date.now()).run();
      
      expect(result.meta.changes).toBe(1);
      expect(result.meta.last_row_id).toBeGreaterThan(0);
      
      // 验证插入的数据
      const task = await env.DB.prepare(
        "SELECT * FROM tasks WHERE id = ?"
      ).bind(result.meta.last_row_id).first() as any;
      
      expect(task.name).toBe("Direct DB test");
      expect(task.done).toBe(0); // SQLite中布尔值存储为整数
    });
  });
});

describe("Configuration Test", () => {
  it("should have access to env", () => {
    expect(env).toBeDefined();
    console.log("Environment variables available:", Object.keys(env));
  });

  it("should have DB binding", () => {
    expect(env.DB).toBeDefined();
  });
}); 