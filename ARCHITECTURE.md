# Create Vino App - 架构设计文档

## 概述

`create-vino-app` 是一个用于快速搭建 Hono + TanStack Router 现代 Web 应用的 CLI 工具。本文档描述了重构后的模块化架构设计。

## 架构目标

1. **模块化**: 清晰的模块边界，每个模块负责单一职责
2. **可扩展**: 易于添加新功能和模板类型
3. **可测试**: 每个模块可独立测试
4. **可维护**: 代码结构清晰，易于理解和修改
5. **插件化**: 支持第三方扩展

## 目录结构

```
create-vino-app/
├── src/
│   ├── index.ts                 # CLI 入口
│   ├── cli/                     # CLI 界面层
│   │   ├── command.ts           # 命令定义和执行
│   │   ├── parser.ts            # 参数解析
│   │   ├── prompts.ts           # 交互式提示
│   │   └── help.ts              # 帮助信息
│   ├── core/                    # 核心业务逻辑
│   │   ├── project-builder.ts   # 项目构建器
│   │   ├── template-manager.ts  # 模板管理
│   │   ├── config.ts            # 配置管理
│   │   └── context.ts           # 执行上下文
│   ├── processors/              # 处理器(插件系统)
│   │   ├── types.ts             # 处理器接口定义
│   │   ├── registry.ts          # 处理器注册表
│   │   ├── auth.processor.ts    # Auth 功能处理
│   │   ├── database.processor.ts # 数据库功能处理
│   │   ├── git.processor.ts     # Git 初始化处理
│   │   └── deps.processor.ts    # 依赖安装处理
│   ├── templates/               # 模板系统
│   │   ├── template.types.ts    # 模板类型定义
│   │   ├── template-loader.ts   # 模板加载器
│   │   ├── transformers/        # 文件转换器
│   │   │   ├── base.ts          # 基础转换器
│   │   │   ├── json.ts          # JSON 文件转换
│   │   │   ├── typescript.ts    # TS 文件转换
│   │   │   └── config.ts        # 配置文件转换
│   │   └── metadata.ts          # 模板元数据
│   ├── utils/                   # 工具函数
│   │   ├── fs.ts                # 文件系统操作
│   │   ├── exec.ts              # 命令执行
│   │   ├── package-manager.ts   # 包管理器工具
│   │   └── logger.ts            # 日志工具
│   └── types/                   # 类型定义
│       ├── config.ts            # 配置类型
│       ├── project.ts           # 项目类型
│       └── index.ts             # 导出所有类型
├── templates/                   # 项目模板
│   ├── full-stack/              
│   │   ├── template.json        # 模板配置
│   │   └── ...                  # 模板文件
│   └── api-only/
│       ├── template.json        # 模板配置
│       └── ...                  # 模板文件
└── config/                      # 默认配置
    └── defaults.json            # 默认配置值
```

## 核心模块设计

### 1. CLI 层 (`cli/`)

负责用户交互和命令解析：

```typescript
// cli/command.ts
export interface Command {
  name: string;
  description: string;
  options: CommandOption[];
  execute(context: ExecutionContext): Promise<void>;
}

// cli/parser.ts
export interface ParsedArgs {
  projectName?: string;
  flags: CommandFlags;
  command: string;
}
```

### 2. 核心层 (`core/`)

#### Project Builder (项目构建器)

```typescript
export class ProjectBuilder {
  constructor(
    private templateManager: TemplateManager,
    private processorRegistry: ProcessorRegistry
  ) {}

  async build(config: ProjectConfig): Promise<void> {
    // 1. 验证配置
    // 2. 加载模板
    // 3. 执行处理器链
    // 4. 生成项目
  }
}
```

#### Execution Context (执行上下文)

```typescript
export interface ExecutionContext {
  projectPath: string;
  config: ProjectConfig;
  template: Template;
  logger: Logger;
  // 共享状态
  state: Map<string, any>;
}
```

### 3. 处理器系统 (`processors/`)

处理器是插件化架构的核心：

```typescript
// processors/types.ts
export interface Processor {
  name: string;
  order: number; // 执行顺序
  
  // 是否应该执行
  shouldRun(context: ExecutionContext): boolean;
  
  // 执行处理
  process(context: ExecutionContext): Promise<void>;
  
  // 回滚操作(可选)
  rollback?(context: ExecutionContext): Promise<void>;
}

// processors/registry.ts
export class ProcessorRegistry {
  private processors: Map<string, Processor> = new Map();
  
  register(processor: Processor): void;
  getProcessors(): Processor[];
  getOrderedProcessors(): Processor[];
}
```

示例处理器：

```typescript
// processors/auth.processor.ts
export class AuthProcessor implements Processor {
  name = 'auth';
  order = 100;
  
  shouldRun(context: ExecutionContext): boolean {
    return context.config.features.auth && context.config.features.database;
  }
  
  async process(context: ExecutionContext): Promise<void> {
    // 1. 移除不需要的文件
    // 2. 修改配置文件
    // 3. 更新依赖
  }
}
```

### 4. 模板系统 (`templates/`)

#### 模板配置

```json
// templates/full-stack/template.json
{
  "name": "full-stack",
  "description": "Full-stack app with Hono API + React",
  "features": {
    "database": {
      "enabled": true,
      "optional": true,
      "files": {
        "remove": ["src/server/db/**"],
        "transform": {
          "package.json": "removeDatabaseDeps",
          "src/server/lib/types.ts": "updateTypesForNoDb"
        }
      }
    },
    "auth": {
      "enabled": true,
      "optional": true,
      "requires": ["database"],
      "files": {
        "remove": ["src/server/modules/auth/**"],
        "transform": {
          "src/server/routes/api.ts": "removeAuthImports"
        }
      }
    }
  },
  "scripts": {
    "init": ["gen:types", "gen:routes", "db:generate"]
  }
}
```

#### 文件转换器

```typescript
// templates/transformers/base.ts
export abstract class FileTransformer {
  abstract canTransform(file: string): boolean;
  abstract transform(content: string, options: TransformOptions): string;
}

// templates/transformers/typescript.ts
export class TypeScriptTransformer extends FileTransformer {
  canTransform(file: string): boolean {
    return file.endsWith('.ts') || file.endsWith('.tsx');
  }
  
  transform(content: string, options: TransformOptions): string {
    // 使用 AST 进行代码转换
  }
}
```

## 数据流

```
用户输入 -> CLI解析 -> 创建执行上下文 -> 项目构建器
                                            |
                                            v
                                      加载模板配置
                                            |
                                            v
                                      执行处理器链
                                            |
                                            v
                                        生成项目
```

## 配置管理

### 项目配置

```typescript
export interface ProjectConfig {
  name: string;
  type: 'full-stack' | 'api-only';
  features: {
    database: boolean;
    auth: boolean;
  };
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  git: boolean;
  install: boolean;
}
```

### 模板特性配置

```typescript
export interface FeatureConfig {
  name: string;
  enabled: boolean;
  optional: boolean;
  requires?: string[];
  conflicts?: string[];
  files: {
    remove?: string[];
    add?: Record<string, string>;
    transform?: Record<string, string>;
  };
  dependencies?: {
    add?: Record<string, string>;
    remove?: string[];
  };
}
```

## 扩展机制

### 添加新的处理器

1. 实现 `Processor` 接口
2. 注册到 `ProcessorRegistry`
3. 处理器自动按顺序执行

### 添加新的模板

1. 创建模板目录
2. 添加 `template.json` 配置
3. 定义特性和转换规则

### 添加新的文件转换器

1. 继承 `FileTransformer`
2. 实现转换逻辑
3. 注册到转换器管理器

## 错误处理

- 每个处理器负责自己的错误处理
- 支持回滚机制
- 详细的错误日志
- 用户友好的错误提示

## 测试策略

1. **单元测试**: 每个模块独立测试
2. **集成测试**: 处理器链测试
3. **端到端测试**: 完整的项目生成测试
4. **快照测试**: 生成的文件内容测试

## 性能优化

1. **并行处理**: 独立的处理器可并行执行
2. **缓存机制**: 模板缓存，避免重复读取
3. **增量更新**: 只修改必要的文件
4. **流式处理**: 大文件使用流处理

## 未来扩展

1. **插件市场**: 支持第三方插件
2. **在线模板**: 从远程加载模板
3. **自定义生成器**: 用户定义的代码生成
4. **升级助手**: 帮助升级现有项目
5. **模板组合**: 组合多个模板特性