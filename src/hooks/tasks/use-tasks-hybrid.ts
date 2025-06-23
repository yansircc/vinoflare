// 混合方案：保留 OpenAPI 文档，但使用轻量级客户端
import type { NewTask, PatchTask } from "@/server/db/schema";
import { api } from "@/lib/api-typed";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@/lib/query-factory";

const taskKeys = createQueryKeys("tasks");

export const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: () => api.tasks.list(),
  });
};

export const useTask = (id: number) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => api.tasks.get({ params: { id } }),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: NewTask) => api.tasks.create({ body: task }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, task }: { id: number; task: PatchTask }) =>
      api.tasks.update({ params: { id }, body: task }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.tasks.delete({ params: { id } }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
};