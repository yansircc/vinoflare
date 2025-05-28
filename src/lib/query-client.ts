import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据保持新鲜的时间（5分钟）
        staleTime: 1000 * 60 * 5,
        // 缓存时间（30分钟）
        gcTime: 1000 * 60 * 30,
        // 重试次数
        retry: 1,
        // 重新获取配置
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        // 突变重试次数
        retry: 1,
      },
    },
  })
} 