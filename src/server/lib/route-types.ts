import type { AuthSession, AuthUser, NewTask, PatchTask, Task } from "@/server/db/schema";

// 手动定义 API 响应类型，避免复杂的类型推断
export interface ApiResponses {
  "/api": {
    GET: {
      output: {
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
  };
  "/api/health": {
    GET: {
      output: {
        status: string;
        timestamp: string;
        version: string;
        environment: string;
      };
    };
  };
  "/api/me": {
    GET: {
      output: {
        user: AuthUser | null;
        session: AuthSession | null;
      };
    };
  };
  "/api/tasks": {
    GET: {
      output: Task[];
    };
    POST: {
      input: NewTask;
      output: Task;
    };
  };
  "/api/tasks/:id": {
    GET: {
      param: { id: string };
      output: Task;
    };
    PATCH: {
      param: { id: string };
      input: PatchTask;
      output: Task;
    };
    DELETE: {
      param: { id: string };
      output: void;
    };
  };
}

// 简化的客户端类型
export type ClientRoute<T extends keyof ApiResponses> = ApiResponses[T];