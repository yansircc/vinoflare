import { z } from 'zod'

// 留言表单的 Zod schema
export const QuoteFormSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  message: z.string().min(1, '留言不能为空').max(500, '留言不能超过500个字符'),
})

// 导出类型
export type QuoteFormData = z.infer<typeof QuoteFormSchema>

// TanStack Form 兼容的验证器 - 按照用户例子的结构
export const TForm = QuoteFormSchema 