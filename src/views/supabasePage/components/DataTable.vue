<template>
  <div class="data-table">
    <el-table :data="data" v-loading="loading" border stripe style="width: 100%"
      @selection-change="handleSelectionChange" empty-text="暂无数据">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="任务名称" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="todo-name">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.description || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" effect="light">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)" size="small" effect="plain">
            {{ getPriorityLabel(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="selectedRows.length > 0" class="batch-actions">
      <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
        批量删除 ({{ selectedRows.length }})
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { Todo } from '../services/todoService'

const props = defineProps<{
  data: Todo[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', row: Todo): void
  (e: 'delete', row: Todo): void
  (e: 'batch-delete', rows: Todo[]): void
}>()

const selectedRows = ref<Todo[]>([])

function handleSelectionChange(rows: Todo[]) {
  selectedRows.value = rows
}

function handleEdit(row: Todo) {
  emit('edit', row)
}

function handleDelete(row: Todo) {
  emit('delete', row)
}

function handleBatchDelete() {
  emit('batch-delete', selectedRows.value)
}

function getStatusType(status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    active: 'primary',
    completed: 'success',
    archived: 'info'
  }
  return map[status] || 'primary'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    archived: '已归档'
  }
  return map[status] || status
}

function getPriorityType(priority: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    low: 'info',
    medium: 'warning',
    high: 'danger'
  }
  return map[priority] || 'info'
}

function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return map[priority] || priority
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<style lang="scss" scoped>
@use 'sass:color';

.data-table {
  .todo-name {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  .batch-actions {
    margin-top: $spacing-3;
    padding: $spacing-3;
    background: color.adjust($danger-color, $lightness: 45%);
    border-radius: $border-radius-base;
    display: flex;
    justify-content: flex-end;
  }

  :deep(.el-table) {
    border-radius: $border-radius-md;
    overflow: hidden;

    th.el-table__cell {
      background-color: $bg-light;
      color: $text-primary;
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
