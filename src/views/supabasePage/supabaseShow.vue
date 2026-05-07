<template>
    <div>
        <h1>Supabase Demo</h1>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
            ⚠️ {{ errorMessage }}
            <button @click="retry">重试</button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">加载中...</div>

        <!-- 数据列表 -->
        <ul v-else>
            <li v-for="todo in todos" :key="todo.id">
                {{ todo.name }}
                <span :class="`status-${todo.status}`">[{{ todo.status }}]</span>
            </li>
            <li v-if="todos.length === 0">暂无数据</li>
        </ul>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../utils/supabase'

interface Todo {
    id: number
    name: string
    status: string
    created_at: string
}

const todos = ref<Todo[]>([])
const loading = ref(true)
const errorMessage = ref('')

async function getTodos() {
    loading.value = true
    errorMessage.value = ''

    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            // 处理特定错误
            if (error.code === '42P01') {
                errorMessage.value = '❌ 表不存在！请先在 Supabase Dashboard 创建 todos 表'
                console.error('建表SQL:', `
          CREATE TABLE public.todos (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `)
            } else if (error.code === '42501') {
                errorMessage.value = '❌ 权限不足！请检查 RLS 策略'
            } else {
                errorMessage.value = `查询失败: ${error.message}`
            }

            console.error('完整错误:', error)
            todos.value = []
            return
        }

        todos.value = data || []

        if (data?.length === 0) {
            console.log('ℹ️ 表存在但数据为空，这是正常的')
        }

    } catch (err) {
        errorMessage.value = '网络错误或配置问题'
        console.error('异常:', err)
    } finally {
        loading.value = false
    }
}

function retry() {
    getTodos()
}

onMounted(() => {
    getTodos()
})
</script>

<style scoped>
.error-message {
    color: #dc3545;
    padding: 12px;
    background: #f8d7da;
    border-radius: 4px;
    margin-bottom: 16px;
}

.loading {
    color: #6c757d;
    font-style: italic;
}

.status-active {
    color: #28a745;
}

.status-completed {
    color: #17a2b8;
}

.status-archived {
    color: #6c757d;
}
</style>