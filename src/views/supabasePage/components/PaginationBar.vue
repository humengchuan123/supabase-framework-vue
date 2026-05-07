<!--
 * @Author: HuMeng 531537052@qq.com
 * @Date: 2026-05-07 08:56:14
 * @LastEditors: HuMeng 531537052@qq.com
 * @LastEditTime: 2026-05-07 09:01:32
 * @FilePath: \work-tool\other\supabase-project\framework\supabase-framework-vue\src\views\supabasePage\components\PaginationBar.vue
 * @Description: 
-->
<template>
  <div class="pagination-bar">
    <div class="pagination-info">
      共 <span class="total-count">{{ total }}</span> 条记录
      第 {{ currentPage }} / {{ totalPages }} 页
    </div>
    <el-pagination v-model:current-page="currentPage" v-model:page-size="currentPageSize"
      :page-sizes="[10, 20, 50, 100]" :total="total" layout="sizes, prev, pager, next, jumper" background
      @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'change', page: number, pageSize: number): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize) || 1
})

function handleSizeChange(size: number) {
  emit('update:pageSize', size)
  emit('change', 1, size)
}

function handleCurrentChange(page: number) {
  emit('update:page', page)
  emit('change', page, props.pageSize)
}
</script>

<style lang="scss" scoped>
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: $spacing-4;
  padding-top: $spacing-3;
  border-top: 1px solid $border-light;

  .pagination-info {
    color: $text-secondary;
    font-size: $font-size-sm;

    .total-count {
      color: $primary-color;
      font-weight: $font-weight-semibold;
    }
  }

  :deep(.el-pagination) {
    .el-pager li.is-active {
      background-color: $primary-color;

      &:hover {
        color: white;
      }
    }
  }
}
</style>
