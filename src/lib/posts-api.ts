import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType, InferResponseType } from 'hono/client'
import { toast } from 'sonner'
import { catchError } from '../utils/catchError'
import { authenticatedClient, client } from './api-client'
import { createQueryKeys } from './api-factory'

// 从 Hono RPC 推断类型，更加类型安全 
type GetLatestPostResponse = InferResponseType<typeof client.posts.latest.$get>['data']
type CreatePostRequest = InferRequestType<typeof client.posts.$post>['json']
type CreatePostResponse = InferResponseType<typeof client.posts.$post>

// 创建 Query Keys
const postsKeys = createQueryKeys('posts')

// 获取最新文章
export const useLatestPost = () => {
  return useQuery({
    queryKey: postsKeys.latest(),
    queryFn: async (): Promise<GetLatestPostResponse> => {
      const { data: result, error } = await catchError(async () => {
        const res = await client.posts.latest.$get()
        return res.json()
      })
      if (error || !result) {
        throw new Error('获取文章失败')
      }
      return result.data
    },
  })
}

// 创建文章
export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation<CreatePostResponse, Error, CreatePostRequest>({
    mutationFn: async (newPost) => {
      const { data: result, error } = await catchError(async () => {
        const res = await authenticatedClient.posts.$post({ json: newPost })
        return res.json()
      })
      if (error || !result) {
        throw new Error('创建文章失败')
      }
      return result
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.all })
      toast.success('文章创建成功！', {
        description: data.message,
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
