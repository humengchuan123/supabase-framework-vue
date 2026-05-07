<template>
  <div class="search-bar">
    <el-input
      v-model="keyword"
      :placeholder="placeholder"
      :prefix-icon="Search"
      clearable
      size="default"
      class="search-input"
      @keyup.enter="handleSearch"
      @clear="handleSearch"
    />
    <el-select
      v-model="selectedStatus"
      placeholder="状态筛选"
      clearable
      class="status-select"
      @change="handleSearch"
    >
      <el-option label="全部" value="all" />
      <el-option label="进行中" value="active" />
      <el-option label="已完成" value="completed" />
      <el-option label="已归档" value="archived" />
    </el-select>
    <el-button type="primary" :icon="Search" @click="handleSearch">
      搜索
    </el-button>
    <el-button :icon="RefreshRight" @click="handleReset">
      重置
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue?: {
    keyword: string
    status: string
  }
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { keyword: string; status: string }): void
  (e: 'search', params: { keyword: string; status: string }): void
}>()

const keyword = ref(props.modelValue?.keyword || '')
const selectedStatus = ref(props.modelValue?.status || 'all')

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    keyword.value = newVal.keyword
    selectedStatus.value = newVal.status
  }
}, { deep: true })

function handleSearch() {
  const params = {
    keyword: keyword.value,
    status: selectedStatus.value
  }
  emit('update:modelValue', params)
  emit('search', params)
}

function handleReset() {
  keyword.value = ''
  selectedStatus.value = 'all'
  handleSearch()
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  gap: $spacing-3;
  margin-bottom: $spacing-4;
  align-items: center;

  .search-input {
    flex: 1;
    max-width: 400px;
  }

  .status-select {
    width: 140px;
  }

  .el-button {
    white-space: nowrap;
  }
}
</style>
