<template>
  <div class="todo-manager">
    <div class="page-header">
      <h1>Supabase Todo 管理系统</h1>
      <p class="subtitle">基于 Vue 3 + Element Plus + Supabase</p>
    </div>

    <div class="toolbar">
      <SearchBar v-model:searchParams="searchParams" placeholder="搜索任务名称或描述..." @search="handleSearch" />
      <el-button type="primary" :icon="Plus" @click="handleAdd">
        新建任务
      </el-button>
    </div>

    <DataTable :data="tableData" :loading="loading" @edit="handleEdit" @delete="handleDelete"
      @batch-delete="handleBatchDelete" />

    <PaginationBar v-model:page="pagination.page" v-model:pageSize="pagination.pageSize" :total="pagination.total"
      @change="handlePageChange" />

    <TodoFormDialog v-model:visible="dialogVisible" :edit-data="currentEditData" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SearchBar from './components/SearchBar.vue'
import DataTable from './components/DataTable.vue'
import PaginationBar from './components/PaginationBar.vue'
import TodoFormDialog from './components/TodoFormDialog.vue'
import { todoService, type Todo } from './services/todoService'

const tableData = ref<Todo[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentEditData = ref<Todo | null>(null)

const searchParams = reactive({
  keyword: '',
  status: 'all'
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

async function fetchData() {
  loading.value = true
  try {
    const result = await todoService.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchParams.keyword,
      status: searchParams.status
    })

    tableData.value = result.data
    pagination.total = result.total
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch(params: { keyword: string; status: string }) {
  searchParams.keyword = params.keyword
  searchParams.status = params.status
  pagination.page = 1
  fetchData()
}

function handlePageChange(page: number, pageSize: number) {
  pagination.page = page
  pagination.pageSize = pageSize
  fetchData()
}

function handleAdd() {
  currentEditData.value = null
  dialogVisible.value = true
}

function handleEdit(row: Todo) {
  currentEditData.value = row
  dialogVisible.value = true
}

async function handleDelete(row: Todo) {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await todoService.delete(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

async function handleBatchDelete(rows: Todo[]) {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${rows.length} 条记录吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = rows.map(row => row.id!).filter(Boolean)
    await todoService.batchDelete(ids)
    ElMessage.success(`成功删除 ${ids.length} 条记录`)
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

async function handleSubmit(data: Omit<Todo, 'id' | 'created_at' | 'updated_at'>, done: () => void) {
  try {
    if (currentEditData.value?.id) {
      await todoService.update(currentEditData.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await todoService.create(data)
      ElMessage.success('创建成功')
    }
    done()
    fetchData()
  } catch (error) {
    done()
    console.error('提交失败:', error)
    ElMessage.error(currentEditData.value ? '更新失败' : '创建失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.todo-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: $spacing-6;

  .page-header {
    margin-bottom: $spacing-6;

    h1 {
      font-size: $font-size-3xl;
      color: $text-primary;
      margin-bottom: $spacing-2;
      font-weight: $font-weight-bold;
    }

    .subtitle {
      color: $text-secondary;
      font-size: $font-size-base;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-4;
    gap: $spacing-4;
    flex-wrap: wrap;

    >*:first-child {
      flex: 1;
      min-width: 300px;
    }

    .el-button {
      white-space: nowrap;
    }
  }
}
</style>
