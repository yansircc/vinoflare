# TanStack Form + Zod 集成指南

## 概述

本项目已成功集成 TanStack Form 和 Zod，提供了强大的表单状态管理和类型安全的验证功能。这次集成带来了更好的用户体验、开发体验和代码可维护性。

## 技术栈

- **TanStack Form** - 无头表单状态管理库
- **Zod** - TypeScript 优先的模式验证库
- **TanStack Query** - 数据获取和状态管理
- **React** - 用户界面库

## 核心特性

### 🎯 类型安全
- 完整的 TypeScript 支持
- Zod schema 自动推断类型
- 编译时错误检查

### 🚀 强大的验证
- 同步和异步验证
- 字段级和表单级验证
- 自定义验证规则

### 💡 优秀的开发体验
- 声明式 API
- 最小化重新渲染
- 灵活的验证时机

### 🎨 用户体验
- 实时验证反馈
- 优雅的错误显示
- 字符计数器
- 提交状态管理

## 项目结构

```
src/
├── lib/
│   └── quote-schema.ts         # Zod 验证模式
├── components/
│   └── QuoteForm.tsx          # TanStack Form 组件
└── routes/
    └── quotes.index.tsx       # 使用表单的页面
```

## 实现详解

### 1. Zod Schema 定义

```typescript
// src/lib/quote-schema.ts
import { z } from 'zod'

export const quoteFormSchema = z.object({
  name: z
    .string()
    .min(1, '姓名不能为空')
    .min(2, '姓名至少需要2个字符')
    .max(50, '姓名不能超过50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '姓名只能包含中文、英文和空格'),
  
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(100, '邮箱地址不能超过100个字符'),
  
  message: z
    .string()
    .min(1, '留言内容不能为空')
    .min(10, '留言内容至少需要10个字符')
    .max(500, '留言内容不能超过500个字符')
    .refine(
      (value) => !value.includes('spam') && !value.includes('广告'),
      '留言内容不能包含垃圾信息'
    ),
})

export type QuoteFormData = z.infer<typeof quoteFormSchema>
```

### 2. TanStack Form 组件

```typescript
// src/components/QuoteForm.tsx
import { useForm } from '@tanstack/react-form'
import { useCreateQuote } from '../lib/quotes-api'
import { defaultQuoteFormValues, quoteFormSchema, type QuoteFormData } from '../lib/quote-schema'

export function QuoteForm({ onSuccess, onCancel }: QuoteFormProps) {
  const createQuoteMutation = useCreateQuote()

  const form = useForm({
    defaultValues: defaultQuoteFormValues,
    validators: {
      onChange: quoteFormSchema,
    },
    onSubmit: async ({ value }: { value: QuoteFormData }) => {
      await createQuoteMutation.mutateAsync(value)
      form.reset()
      onSuccess?.()
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit()
    }}>
      <form.Field name="name">
        {(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <div className="error">
                {field.state.meta.errors.join(', ')}
              </div>
            )}
          </div>
        )}
      </form.Field>
    </form>
  )
}
```

### 3. 验证规则详解

#### 姓名验证
- **必填检查**: `min(1)` - 不能为空
- **长度限制**: `min(2)` 和 `max(50)` - 2-50个字符
- **格式验证**: 正则表达式 - 只允许中文、英文和空格

#### 邮箱验证
- **必填检查**: `min(1)` - 不能为空
- **格式验证**: `email()` - 标准邮箱格式
- **长度限制**: `max(100)` - 最多100个字符

#### 留言内容验证
- **必填检查**: `min(1)` - 不能为空
- **最小长度**: `min(10)` - 至少10个字符
- **最大长度**: `max(500)` - 最多500个字符
- **内容过滤**: `refine()` - 不允许垃圾信息

### 4. 表单状态管理

#### 字段状态
```typescript
field.state = {
  value: string,           // 当前值
  meta: {
    errors: string[],      // 验证错误
    isValid: boolean,      // 是否有效
    isTouched: boolean,    // 是否被触摸
    isDirty: boolean,      // 是否被修改
  }
}
```

#### 表单状态
```typescript
form.state = {
  values: QuoteFormData,   // 所有字段值
  errors: string[],        // 表单级错误
  canSubmit: boolean,      // 是否可提交
  isSubmitting: boolean,   // 是否正在提交
}
```

## 验证时机

### onChange 验证
- **触发时机**: 每次输入值改变
- **用途**: 实时反馈，即时显示错误
- **性能**: 高频触发，需要优化

### onBlur 验证
- **触发时机**: 字段失去焦点
- **用途**: 用户完成输入后验证
- **性能**: 低频触发，性能友好

### onSubmit 验证
- **触发时机**: 表单提交时
- **用途**: 最终验证，确保数据完整性
- **性能**: 一次性验证，性能最佳

## 错误处理

### 字段级错误
```typescript
{field.state.meta.errors.length > 0 && (
  <div className="text-red-500 text-sm">
    {field.state.meta.errors.join(', ')}
  </div>
)}
```

### 表单级错误
```typescript
<form.Subscribe selector={(state) => state.errors}>
  {(errors) =>
    errors.length > 0 && (
      <div className="error-container">
        {errors.map((error, index) => (
          <div key={index}>{String(error)}</div>
        ))}
      </div>
    )
  }
</form.Subscribe>
```

## 用户体验增强

### 1. 字符计数器
```typescript
<div className="text-gray-400 text-xs">
  {field.state.value.length}/500
</div>
```

### 2. 提交状态
```typescript
<form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <button 
      type="submit" 
      disabled={!canSubmit || isSubmitting}
    >
      {isSubmitting ? '提交中...' : '提交留言'}
    </button>
  )}
</form.Subscribe>
```

### 3. 表单重置
```typescript
// 提交成功后自动重置
onSubmit: async ({ value }) => {
  await createQuoteMutation.mutateAsync(value)
  form.reset() // 重置表单
  onSuccess?.()
}
```

## 与 TanStack Query 集成

### 数据提交
```typescript
const createQuoteMutation = useCreateQuote()

onSubmit: async ({ value }) => {
  await createQuoteMutation.mutateAsync(value)
  // 自动触发缓存更新和 UI 刷新
}
```

### 加载状态
```typescript
disabled={!canSubmit || isSubmitting || createQuoteMutation.isPending}
```

## 样式设计

### 极简输入框
```css
.input-minimal {
  @apply w-full border-0 border-b border-gray-200 bg-transparent 
         px-0 py-2 text-gray-900 placeholder-gray-400 
         focus:border-gray-900 focus:outline-none focus:ring-0;
}
```

### 错误状态
```css
.error-text {
  @apply mt-1 text-red-500 text-sm;
}
```

### 提交按钮
```css
.submit-button {
  @apply rounded-full bg-gray-900 px-6 py-2 text-sm text-white 
         transition-colors hover:bg-gray-700 
         disabled:bg-gray-400 disabled:cursor-not-allowed;
}
```

## 性能优化

### 1. 最小化重新渲染
- 使用 `form.Subscribe` 订阅特定状态
- 避免不必要的组件重新渲染

### 2. 验证优化
- 合理选择验证时机
- 避免过于复杂的同步验证

### 3. 内存管理
- 表单卸载时自动清理
- 避免内存泄漏

## 最佳实践

### 1. Schema 设计
- **单一职责**: 每个字段一个明确的验证目的
- **错误信息**: 提供清晰、友好的错误提示
- **类型安全**: 充分利用 TypeScript 类型推断

### 2. 组件设计
- **可复用**: 设计通用的表单组件
- **可配置**: 支持不同的验证规则和样式
- **可测试**: 便于单元测试和集成测试

### 3. 用户体验
- **即时反馈**: 提供实时验证反馈
- **清晰指引**: 明确的标签和占位符
- **状态提示**: 清楚的加载和错误状态

## 与其他方案对比

| 特性 | TanStack Form + Zod | React Hook Form | Formik |
|------|-------------------|-----------------|--------|
| 类型安全 | ✅ 完整支持 | ✅ 良好支持 | ⚠️ 部分支持 |
| 性能 | ✅ 最小重渲染 | ✅ 优秀 | ⚠️ 一般 |
| 验证 | ✅ Zod 集成 | ✅ 多种方案 | ✅ Yup 集成 |
| 学习曲线 | ⚠️ 中等 | ✅ 简单 | ⚠️ 复杂 |
| 生态系统 | ✅ TanStack 生态 | ✅ 丰富 | ✅ 成熟 |
| 包大小 | ✅ 轻量 | ✅ 很小 | ❌ 较大 |

## 总结

TanStack Form + Zod 的集成为项目带来了：

1. **强大的类型安全** - 编译时错误检查
2. **灵活的验证系统** - 支持复杂验证逻辑
3. **优秀的性能** - 最小化重新渲染
4. **良好的开发体验** - 声明式 API 和丰富的功能
5. **一致的生态系统** - 与 TanStack Query 完美集成

这个解决方案特别适合需要复杂表单验证和高性能要求的现代 React 应用。 