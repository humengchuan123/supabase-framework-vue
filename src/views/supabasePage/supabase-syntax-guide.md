# Supabase 常用语法指南

> 本文档基于 framework 项目中的实际使用场景整理，涵盖 Supabase 在 Vue + TypeScript 项目中的常用操作。

---

## 📚 目录

- [1. 初始化客户端](#1-初始化客户端)
- [2. 查询数据 (SELECT) - READ](#2-查询数据-select---read)
- [3. 插入数据 (INSERT) - CREATE](#3-插入数据-insert---create)
- [4. 更新数据 (UPDATE)](#4-更新数据-update)
- [5. 删除数据 (DELETE)](#5-删除数据-delete)
- [6. 常用过滤器 (Filters)](#6-常用过滤器-filters)
- [7. 分页和排序](#7-分页和排序)
- [8. 关联查询 (Relations)](#8-关联查询-relations)
- [9. 认证 (Auth)](#9-认证-auth)
- [10. 最佳实践建议](#10-最佳实践建议)

---

## 1. 初始化客户端

**文件位置**: `src/utils/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 环境变量配置

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## 2. 查询数据 (SELECT) - READ

### 基础查询

```typescript
// 查询所有数据
const { data, error } = await supabase.from('todos').select()

// 查询指定字段
const { data, error } = await supabase.from('todos').select('id, name, status')
```

### 条件查询

```typescript
const { data, error } = await supabase
  .from('todos')
  .select()
  .eq('status', 'active')           // 等于
  .gte('age', 18)                   // 大于等于
  .order('created_at', { ascending: false })  // 排序（降序）
  .range(0, 9)                      // 分页（第 0-9 条）
```

### 单条查询

```typescript
const { data, error } = await supabase
  .from('todos')
  .select()
  .eq('id', 1)
  .single()                         // 返回单条对象而非数组
```

### 完整示例

```typescript
import { ref, onMounted } from 'vue'
import { supabase } from '../../utils/supabase'

interface Todo {
  id: number
  name: string
  status: string
  created_at: string
}

const todos = ref<Todo[]>([])

async function getTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select()
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('查询失败:', error.message)
    return
  }

  todos.value = data || []
}

onMounted(() => {
  getTodos()
})
```

---

## 3. 插入数据 (INSERT) - CREATE

### 插入单条数据

```typescript
const { data, error } = await supabase
  .from('todos')
  .insert([
    { name: '学习 Supabase', status: 'active' }
  ])
  .select()  // 返回插入后的完整数据
```

### 插入多条数据

```typescript
const { data, error } = await supabase
  .from('todos')
  .insert([
    { name: '任务1', status: 'active' },
    { name: '任务2', status: 'inactive' },
    { name: '任务3', status: 'pending' }
  ])
  .select()
```

### 完整示例

```typescript
async function addTodo(name: string) {
  const { data, error } = await supabase
    .from('todos')
    .insert([{ name, status: 'active' }])
    .select()

  if (error) {
    console.error('插入失败:', error.message)
    return null
  }

  return data?.[0]
}
```

---

## 4. 更新数据 (UPDATE)

### 根据条件更新

```typescript
const { data, error } = await supabase
  .from('todos')
  .update({ status: 'completed' })
  .eq('id', 1)
  .select()  // 返回更新后的数据
```

### 批量更新

```typescript
const { data, error } = await supabase
  .from('todos')
  .update({ status: 'archived' })
  .eq('status', 'completed')
  .select()
```

### 部分更新（只更新传入的字段）

```typescript
async function updateTodo(id: number, updates: Partial<Todo>) {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) {
    console.error('更新失败:', error.message)
    return null
  }

  return data?.[0]
}
```

---

## 5. 删除数据 (DELETE)

### 删除单条数据

```typescript
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('id', 1)
```

### 条件删除

```typescript
const { error } = await supabase
  .from('todos')
  .delete()
  .eq('status', 'archived')
```

### 删除并返回被删除的数据

```typescript
const { data, error } = await supabase
  .from('todos')
  .delete()
  .eq('id', 1)
  .select()  // 返回被删除的数据
```

### 完整示例

```typescript
async function deleteTodo(id: number) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('删除失败:', error.message)
    return false
  }

  return true
}
```

---

## 6. 常用过滤器 (Filters)

| 方法 | 说明 | 示例 |
|------|------|------|
| `.eq()` | 等于 | `.eq('status', 'active')` |
| `.neq()` | 不等于 | `.neq('status', 'deleted')` |
| `.gt()` | 大于 | `.gt('age', 18)` |
| `.gte()` | 大于等于 | `.gte('age', 18)` |
| `.lt()` | 小于 | `.lt('age', 65)` |
| `.lte()` | 小于等于 | `.lte('age', 65)` |
| `.like()` | SQL LIKE 模糊匹配 | `.like('name', '%test%')` |
| `.ilike()` | 忽略大小写匹配 | `.ilike('name', '%TEST%')` |
| `.in()` | 值在数组中 | `.in('id', [1, 2, 3])` |
| `.is()` | 检查是否为 NULL/TRUE/FALSE | `.is('deleted_at', null)` |
| `.not()` | 否定条件 | `.not('status', 'eq', 'deleted')` |

### 组合使用示例

```typescript
// 复杂条件查询
const { data } = await supabase
  .from('users')
  .select()
  .gte('age', 18)                    // 年龄 >= 18
  .lte('age', 65)                    // 年龄 <= 65
  .in('status', ['active', 'pending']) // 状态为 active 或 pending
  .is('deleted_at', null)            // 未删除
  .like('email', '%@company.com')    // 邮箱域名过滤
  .order('created_at', { ascending: false })
```

---

## 7. 分页和排序

### 使用 range() 分页

```typescript
// 获取第 1 页，每页 10 条（offset=0, limit=10）
const { data } = await supabase
  .from('todos')
  .select()
  .range(0, 9)                       // 从第 0 条到第 9 条

// 获取第 2 页，每页 10 条（offset=10, limit=10）
const { data } = await supabase
  .from('todos')
  .select()
  .range(10, 19)                     // 从第 10 条到第 19 条
```

### 使用 limit() 和 offset()

```typescript
const { data } = await supabase
  .from('todos')
  .select()
  .limit(10)                         // 限制返回 10 条
  // .offset(20)                      // 跳过前 20 条（不推荐大数据量使用）
```

### 排序

```typescript
// 单字段排序
const { data } = await supabase
  .from('todos')
  .select()
  .order('created_at', { ascending: false })  // 降序（最新在前）

// 多字段排序
const { data } = await supabase
  .from('todos')
  .select()
  .order('status', { ascending: true })       // 先按状态升序
  .order('created_at', { ascending: false })  // 再按时间降序
```

### 完整分页示例

```typescript
interface PaginationData {
  data: Todo[]
  page: number
  pageSize: number
  total: number
}

async function getTodosPaginated(page: number = 1, pageSize: number = 10): Promise<PaginationData> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // 并行请求数据和总数
  const [{ count }, { data }] = await Promise.all([
    supabase.from('todos').select('*', { count: 'exact', head: true }),
    supabase.from('todos').select().range(from, to)
  ])

  return {
    data: data || [],
    page,
    pageSize,
    total: count || 0
  }
}
```

---

## 8. 关联查询 (Relations)

### 一对一 / 多对一关系

```typescript
// 查询文章及其作者
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    content,
    users (
      id,
      name,
      email,
      avatar_url
    )
  `)
```

### 一对多关系

```typescript
// 查询用户及其所有文章
const { data } = await supabase
  .from('users')
  .select(`
    id,
    name,
    email,
    posts (
      id,
      title,
      created_at
    )
  `)
```

### 嵌套关联

```typescript
// 查询订单及其商品和用户信息
const { data } = await supabase
  .from('orders')
  .select(`
    id,
    total,
    created_at,
    users (
      id,
      name,
      email
    ),
    order_items (
      id,
      quantity,
      products (
        id,
        name,
        price
      )
    )
  `)
```

### 外键过滤

```typescript
// 只返回有关联数据的记录
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    users!inner (        // !inner 表示 INNER JOIN
      id,
      name
    )
  `)
```

---

## 9. 认证 (Auth)

### 用户注册

```typescript
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('注册失败:', error.message)
    return null
  }

  return data.user
}
```

### 用户登录

```typescript
async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('登录失败:', error.message)
    return null
  }

  return data.user
}
```

### 用户登出

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('登出失败:', error.message)
    return false
  }

  return true
}
```

### 获取当前用户

```typescript
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('获取用户失败:', error.message)
    return null
  }

  return user
}
```

### 监听认证状态变化

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('认证状态变化:', event)
  
  if (event === 'SIGNED_IN') {
    console.log('用户登录:', session?.user)
  } else if (event === 'SIGNED_OUT') {
    console.log('用户登出')
  }
})
```

### 第三方登录（以 GitHub 为例）

```typescript
async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) {
    console.error('GitHub 登录失败:', error.message)
  }
}
```

---

## 10. 最佳实践建议

### ✅ 错误处理

```typescript
// 始终检查错误
async function safeQuery() {
  const { data, error } = await supabase.from('todos').select()

  if (error) {
    // 根据错误类型处理
    switch (error.code) {
      case '23505':  // 唯一约束冲突
        console.error('数据已存在')
        break
      case 'PGRST116':  // 未找到记录
        console.error('记录不存在')
        break
      default:
        console.error('查询错误:', error.message)
    }
    return []
  }

  return data || []
}
```

### ✅ TypeScript 类型定义

```typescript
// 定义数据类型
interface Todo {
  id: number
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  user_id?: string
  created_at: string
  updated_at: string
}

// 使用泛型约束返回类型
const { data }: { data: Todo[] | null } = await supabase
  .from('todos')
  .select<Todo>()
```

### ✅ Row Level Security (RLS)

Supabase 的安全特性：

```sql
-- 启用 RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的数据
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- 创建策略：用户只能插入自己的数据
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### ✅ 性能优化

```typescript
// 1. 只查询需要的字段
const { data } = await supabase
  .from('todos')
  .select('id, name, status')  // 避免 SELECT *

// 2. 使用索引字段进行过滤
const { data } = await supabase
  .from('todos')
  .select()
  .eq('user_id', userId)       // 确保 user_id 有索引

// 3. 合理分页，避免一次性加载大量数据
const { data } = await supabase
  .from('todos')
  .select()
  .range(0, 19)                // 每页 20 条

// 4. 并行请求独立数据
const [todosRes, usersRes] = await Promise.all([
  supabase.from('todos').select(),
  supabase.from('users').select()
])
```

### ✅ 实时订阅 (Realtime)

```typescript
// 监听数据变化
const subscription = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    {
      event: '*',              // INSERT, UPDATE, DELETE, 或 *
      schema: 'public',
      table: 'todos'
    },
    (payload) => {
      console.log('变化类型:', payload.eventType)
      console.log('新数据:', payload.new)
      console.log('旧数据:', payload.old)
      
      // 根据事件类型更新本地状态
      switch (payload.eventType) {
        case 'INSERT':
          todos.value.push(payload.new as Todo)
          break
        case 'UPDATE':
          const index = todos.value.findIndex(t => t.id === payload.new.id)
          if (index !== -1) todos.value[index] = payload.new as Todo
          break
        case 'DELETE':
          todos.value = todos.value.filter(t => t.id !== payload.old.id)
          break
      }
    }
  )
  .subscribe()

// 组件卸载时取消订阅
onUnmounted(() => {
  supabase.removeChannel(subscription)
})
```

---

## 🔧 快速参考卡片

### CRUD 操作速查

| 操作 | 方法 | 示例 |
|------|------|------|
| **Create** | `.insert()` | `supabase.from('table').insert([data]).select()` |
| **Read** | `.select()` | `supabase.from('table').select().eq('id', 1)` |
| **Update** | `.update()` | `supabase.from('table').update(data).eq('id', 1).select()` |
| **Delete** | `.delete()` | `supabase.from('table').delete().eq('id', 1)` |

### 响应结构

```typescript
// 成功响应
{
  data: T | T[] | null   // 请求数据
  error: null            // 无错误
}

// 错误响应
{
  data: null             // 无数据
  error: {
    message: string      // 错误信息
    code: string         // 错误代码
    details: string      // 详细信息
    hint: string         // 解决提示
  }
}
```

---

## 📖 相关资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript API 参考](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Vue.js 指南](https://supabase.com/docs/guides/get-started/vue-vite)
- [Row Level Security 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime 文档](https://supabase.com/docs/guides/realtime)

---

> **最后更新**: 2026-05-07
>
> **适用版本**: @supabase/supabase-js ^2.x
>
> **基于框架**: Vue 3 + TypeScript + Vite
