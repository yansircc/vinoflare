// 手动定义 API 类型，避免复杂的类型推断
import type { Task } from "@/server/db/schema";

// API 响应类型
export interface ApiResponses {
  "/api/tasks": {
    GET: Task[];
    POST: Task;
  };
  "/api/tasks/:id": {
    GET: Task;
    PATCH: Task;
    DELETE: { success: boolean };
  };
  "/api": {
    GET: {
      name: string;
      version: string;
      description: string;
      endpoints: {
        tasks: string;
        health: string;
        me: string;
      };
      timestamp: string;
    };
  };
  "/api/health": {
    GET: {
      status: string;
      timestamp: string;
      version: string;
      environment: string;
    };
  };
  "/api/me": {
    GET: {
      user: any;
      session: any;
    };
  };
}

// 请求参数类型
export interface ApiParams {
  "/api/tasks/:id": {
    id: string;
  };
}

// 请求体类型
export interface ApiBody {
  "/api/tasks": {
    POST: Partial<Task>;
  };
  "/api/tasks/:id": {
    PATCH: Partial<Task>;
  };
}