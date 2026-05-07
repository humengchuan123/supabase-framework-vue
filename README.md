# Supabase Framework Vue

基于 **Vue 3 + TypeScript + Element Plus + Supabase** 的全栈 CRUD 管理系统框架，开箱即用。

## 技术栈

| 技术         | 版本   | 说明                                   |
| ------------ | ------ | -------------------------------------- |
| Vue 3        | ^3.5   | 组合式 API + `<script setup>`          |
| TypeScript   | ~6.0   | 全局类型安全                           |
| Vite         | ^8.0   | 极速开发构建                           |
| Element Plus | ^2.13  | 企业级 UI 组件库                       |
| Supabase     | ^2.105 | BaaS 后端服务（PostgreSQL + REST API） |
| Sass         | ^1.99  | SCSS 预处理器 + 全局变量系统           |

## 功能特性

- ✅ **数据查询** - 列表展示、关键词搜索、状态筛选
- ✅ **数据新增** - 表单验证、对话框交互
- ✅ **数据编辑** - 复用表单、自动填充
- ✅ **数据删除** - 单条删除、批量删除、二次确认
- ✅ **分页功能** - 页码切换、每页数量调整、跳转指定页
- ✅ **SCSS 变量系统** - 颜色/字体/间距/圆角/阴影/断点/混合器
- ✅ **组件化架构** - 搜索/表格/分页/表单独立组件，按需复用
- ✅ **数据服务层** - Supabase 操作封装，与视图解耦

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，填入 Supabase 配置：

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

配置值在 **Supabase Dashboard → Settings → API** 中获取。

### 3. 初始化数据库

在 **Supabase Dashboard → SQL Editor** 中执行：

```sql
CREATE TABLE IF NOT EXISTS public.todos (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read" ON public.todos FOR SELECT USING (true);
CREATE POLICY "Allow all insert" ON public.todos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.todos FOR UPDATE USING (true);
CREATE POLICY "Allow all delete" ON public.todos FOR DELETE USING (true);

INSERT INTO public.todos (name, description, status, priority) VALUES
  ('学习 Vue 3 组合式 API', '深入学习 Composition API 和响应式原理', 'active', 'high'),
  ('完成项目文档', '编写 README 和使用说明', 'completed', 'medium'),
  ('代码审查', '审查团队提交的 PR', 'active', 'low');
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── assets/
│   ├── reset.css                  # 样式重置
│   └── _variables.scss            # SCSS 全局变量和混合器
├── utils/
│   └── supabase.ts                # Supabase 客户端初始化
├── views/
│   └── supabasePage/
│       ├── TodoManager.vue        # 主入口组件（整合所有功能）
│       ├── components/
│       │   ├── SearchBar.vue      # 搜索栏（关键词 + 状态筛选）
│       │   ├── DataTable.vue      # 数据表格（展示 + 操作）
│       │   ├── PaginationBar.vue  # 分页器
│       │   └── TodoFormDialog.vue # 新增/编辑对话框
│       ├── services/
│       │   └── todoService.ts     # Supabase 数据服务层
│       └── supabase-syntax-guide.md
├── App.vue
└── main.ts                        # Element Plus 全局注册
```

## 组件说明

### SearchBar - 搜索栏

| Props         | 类型                  | 说明               |
| ------------- | --------------------- | ------------------ |
| `modelValue`  | `{ keyword, status }` | 双向绑定的搜索参数 |
| `placeholder` | `string`              | 输入框占位文本     |

| Events    | 参数                  | 说明     |
| --------- | --------------------- | -------- |
| `@search` | `{ keyword, status }` | 触发搜索 |

### DataTable - 数据表格

| Props     | 类型      | 说明     |
| --------- | --------- | -------- |
| `data`    | `Todo[]`  | 表格数据 |
| `loading` | `boolean` | 加载状态 |

| Events          | 参数     | 说明     |
| --------------- | -------- | -------- |
| `@edit`         | `Todo`   | 编辑某行 |
| `@delete`       | `Todo`   | 删除某行 |
| `@batch-delete` | `Todo[]` | 批量删除 |

### PaginationBar - 分页器

| Props      | 类型     | 说明                |
| ---------- | -------- | ------------------- |
| `page`     | `number` | 当前页码（v-model） |
| `pageSize` | `number` | 每页数量（v-model） |
| `total`    | `number` | 总记录数            |

| Events    | 参数               | 说明           |
| --------- | ------------------ | -------------- |
| `@change` | `(page, pageSize)` | 页码或数量变化 |

### TodoFormDialog - 表单对话框

| Props      | 类型           | 说明                      |
| ---------- | -------------- | ------------------------- |
| `visible`  | `boolean`      | 对话框显示状态（v-model） |
| `editData` | `Todo \| null` | 编辑时传入已有数据        |

| Events    | 参数           | 说明                        |
| --------- | -------------- | --------------------------- |
| `@submit` | `(data, done)` | 提交表单，`done` 为完成回调 |

## 数据服务层

`todoService.ts` 封装了所有 Supabase 操作：

| 方法               | 参数                                               | 返回值                    | 说明     |
| ------------------ | -------------------------------------------------- | ------------------------- | -------- |
| `getList(params)`  | `{ page, pageSize, keyword, status }`              | `PaginatedResponse<Todo>` | 分页查询 |
| `getById(id)`      | `number`                                           | `Todo \| null`            | 获取详情 |
| `create(todo)`     | `Omit<Todo, 'id' \| 'created_at' \| 'updated_at'>` | `Todo`                    | 创建记录 |
| `update(id, todo)` | `number, Partial<Todo>`                            | `Todo`                    | 更新记录 |
| `delete(id)`       | `number`                                           | `void`                    | 删除记录 |
| `batchDelete(ids)` | `number[]`                                         | `void`                    | 批量删除 |

### Todo 数据类型

```typescript
interface Todo {
  id?: number;
  name: string;
  description?: string;
  status: "active" | "completed" | "archived";
  priority: "low" | "medium" | "high";
  created_at?: string;
  updated_at?: string;
}
```

## SCSS 变量系统

全局变量在 `src/assets/_variables.scss` 中定义，通过 Vite `additionalData` 自动注入所有组件。

### 可用变量

| 类别 | 示例变量                                    | 说明               |
| ---- | ------------------------------------------- | ------------------ |
| 颜色 | `$primary-color`, `$danger-color`           | 主色/辅助色/中性色 |
| 字体 | `$font-size-base`, `$font-weight-bold`      | 大小/字重/行高     |
| 间距 | `$spacing-1` ~ `$spacing-16`                | 4px 网格系统       |
| 圆角 | `$border-radius-sm` ~ `$border-radius-full` | 圆角大小           |
| 阴影 | `$shadow-sm` ~ `$shadow-xl`                 | 层级阴影           |
| 断点 | `$breakpoint-sm` ~ `$breakpoint-2xl`        | 响应式断点         |

### 可用混合器

```scss
@include flex-center; // Flex 居中
@include flex-between; // Flex 两端对齐
@include text-truncate; // 单行文本截断
@include text-clamp(3); // 多行文本截断
@include card-style; // 卡片样式
@include button-base; // 按钮基础样式
@include input-base; // 输入框基础样式
@include respond-to(md); // 响应式断点
@include absolute-center; // 绝对定位居中
```

## 生产环境 RLS 策略

当前 RLS 策略允许所有操作，仅适合开发环境。生产环境建议：

1. 集成 Supabase Auth 登录
2. 在表中添加 `user_id UUID REFERENCES auth.users(id)` 字段
3. 使用基于用户身份的 RLS 策略：

```sql
ALTER TABLE public.todos ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can view own todos" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);
```
