# Posts Module

这是一个完全自包含的模块示例，展示了新的模块化架构。

## 文件结构

```
posts/
├── index.ts          # 模块入口和公共 API 导出
├── posts.table.ts    # 数据库表定义
├── posts.schema.ts   # Zod 验证 schemas
├── posts.types.ts    # TypeScript 类型定义
├── posts.handlers.ts # 业务逻辑处理函数
├── posts.routes.ts   # 路由定义
├── posts.openapi.ts  # OpenAPI 文档
├── posts.test.ts     # 单元测试
└── README.md         # 模块文档
```

## 架构特点

1. **完全自包含** - 所有相关代码都在模块目录内
2. **清晰的导出** - 通过 index.ts 统一管理公共 API
3. **类型安全** - 从数据库到 API 的完整类型链
4. **易于插拔** - 添加/删除模块只需操作单个目录

## 使用方式

### 内部引用
```typescript
// 模块内部文件相互引用
import { posts } from "./posts.table";
import { selectPostSchema } from "./posts.schema";
import type { Post } from "./posts.types";
```

### 外部引用
```typescript
// 从模块外部引用
import { posts, selectPostSchema, type Post } from "@/server/modules/posts";
```

## 集成说明

1. 模块会自动注册到路由系统
2. 数据库 schema 通过 `db/index.ts` 集成
3. 类型通过 `types/index.ts` 重新导出（向后兼容）

## 优势

- ✅ 高内聚，低耦合
- ✅ 独立开发和测试
- ✅ 清晰的依赖边界
- ✅ 易于版本控制
- ✅ 支持团队协作