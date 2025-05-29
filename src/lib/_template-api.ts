/**
 * 客户端 API 模板文件
 * 
 * 这个文件展示了如何创建类型安全的客户端 API
 * 复制这个文件并根据你的需求进行修改
 */

import { hc } from 'hono/client'
import type { AppType } from '../index'
import { createCrudHooks, getApiBaseUrl } from './api-factory'

// 1. 导入你的类型定义
// import type { YourItem, YourItemCreate } from '../server/db/types'

// 临时类型定义（替换为你的实际类型）
interface TemplateItem {
  id: number
  name: string
  createdAt: string
}

interface TemplateItemCreate {
  name: string
}

// 2. 创建 RPC 客户端
const rpcClient = hc<AppType>(getApiBaseUrl()) as any

// 3. 定义 API 函数
const templateApi = {
  getAll: async (): Promise<TemplateItem[]> => {
    // 替换 'template' 为你的资源名称
    const res = await rpcClient.api.template.$get()
    if (!res.ok) {
      throw new Error(`获取项目失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data || []
  },

  getById: async (id: string | number): Promise<TemplateItem> => {
    const res = await rpcClient.api.template[':id'].$get({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`获取项目失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  create: async (data: TemplateItemCreate): Promise<TemplateItem> => {
    const res = await rpcClient.api.template.$post({
      json: data
    })
    if (!res.ok) {
      throw new Error(`创建项目失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  update: async ({ id, data }: { 
    id: string | number
    data: Partial<TemplateItem> 
  }): Promise<TemplateItem> => {
    const res = await rpcClient.api.template[':id'].$put({
      param: { id: id.toString() },
      json: data
    })
    if (!res.ok) {
      throw new Error(`更新项目失败: ${res.status}`)
    }
    const result = await res.json()
    return result.data
  },

  delete: async (id: string | number): Promise<void> => {
    const res = await rpcClient.api.template[':id'].$delete({
      param: { id: id.toString() }
    })
    if (!res.ok) {
      throw new Error(`删除项目失败: ${res.status}`)
    }
  }
}

// 4. 使用工厂创建 CRUD hooks
const templateHooks = createCrudHooks<TemplateItem, TemplateItemCreate>({
  resource: 'template', // 替换为你的资源名称
  api: templateApi,
  getId: (item) => item.id,
})

// 5. 导出 hooks（重命名为你的资源名称）
export const {
  queryKeys: templateKeys,
  useList: useTemplateItems,
  useItem: useTemplateItem,
  useCreate: useCreateTemplateItem,
  useUpdate: useUpdateTemplateItem,
  useDelete: useDeleteTemplateItem,
} = templateHooks

/**
 * 使用步骤：
 * 
 * 1. 复制这个文件并重命名（例如：users-api.ts）
 * 2. 替换所有的 'template' 为你的资源名称
 * 3. 导入正确的类型定义
 * 4. 更新 API 路径和函数名称
 * 5. 在组件中导入和使用 hooks
 * 
 * 示例用法：
 * 
 * ```tsx
 * import { useTemplateItems, useCreateTemplateItem } from '../lib/template-api'
 * 
 * function TemplateList() {
 *   const { data: items, isLoading } = useTemplateItems()
 *   const createItem = useCreateTemplateItem()
 * 
 *   if (isLoading) return <div>加载中...</div>
 * 
 *   return (
 *     <div>
 *       <button onClick={() => createItem.mutate({ name: '新项目' })}>
 *         添加项目
 *       </button>
 *       {items?.map(item => (
 *         <div key={item.id}>{item.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */ 