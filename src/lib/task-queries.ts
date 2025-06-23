// Task-specific query factory - 避免 Hono RPC 类型推断
import type { NewTask, PatchTask, Task } from "@/server/db/schema";
import { createQueryKeys } from "./query-factory";

const taskKeys = createQueryKeys("tasks");

const fetchApi = async <T>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }

  return res.json();
};

export const taskQueries = {
  all: () => ({
    queryKey: taskKeys.all,
    queryFn: () => fetchApi<Task[]>("/api/tasks"),
  }),

  detail: (id: number) => ({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchApi<Task>(`/api/tasks/${id}`),
    enabled: !!id,
  }),
};

export const taskMutations = {
  create: () => ({
    mutationFn: (task: NewTask) =>
      fetchApi<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      }),
  }),

  update: () => ({
    mutationFn: ({ id, task }: { id: number; task: PatchTask }) =>
      fetchApi<Task>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(task),
      }),
  }),

  delete: () => ({
    mutationFn: (id: number) =>
      fetchApi<{ success: boolean }>(`/api/tasks/${id}`, {
        method: "DELETE",
      }),
  }),
};