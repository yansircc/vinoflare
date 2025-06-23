// 轻量级 API 客户端，避免 Hono RPC 的复杂类型推断
import type { NewTask, PatchTask, Task } from "@/server/db/schema";

interface ApiError {
  message: string;
  error?: string;
}

class ApiClient {
  constructor(private baseUrl: string = "") {}

  private async request<T>(
    path: string,
    options?: RequestInit
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        message: `Request failed: ${res.statusText}`,
      }));
      throw new Error(error.message);
    }

    return res.json();
  }

  // Tasks API
  tasks = {
    list: () => 
      this.request<Task[]>("/api/tasks"),
    
    get: (id: number) => 
      this.request<Task>(`/api/tasks/${id}`),
    
    create: (task: NewTask) =>
      this.request<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      }),
    
    update: (id: number, task: PatchTask) =>
      this.request<Task>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(task),
      }),
    
    delete: (id: number) =>
      this.request<{ success: boolean }>(`/api/tasks/${id}`, {
        method: "DELETE",
      }),
  };

  // Health check
  health = () =>
    this.request<{
      status: string;
      timestamp: string;
      version: string;
      environment: string;
    }>("/api/health");

  // User info
  me = () =>
    this.request<{
      user: any;
      session: any;
    }>("/api/me");
}

export const apiClient = new ApiClient();