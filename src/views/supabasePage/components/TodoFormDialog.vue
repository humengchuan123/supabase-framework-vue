<template>
  <el-dialog :model-value="visible" :title="dialogTitle" width="600px" :close-on-click-modal="false"
    @update:model-value="(val: boolean) => emit('update:visible', val)" @closed="handleClosed">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right"
      class="todo-form">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入任务名称" maxlength="100" show-word-limit />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入任务描述（可选）" maxlength="500"
          show-word-limit />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="进行中" value="active" />
          <el-option label="已完成" value="completed" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-radio-group v-model="formData.priority">
          <el-radio value="low">低</el-radio>
          <el-radio value="medium">中</el-radio>
          <el-radio value="high">高</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Todo } from '../services/todoService'

const props = defineProps<{
  visible: boolean
  editData?: Todo | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'submit', data: Omit<Todo, 'id' | 'created_at' | 'updated_at'>, done: () => void): void
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEdit = computed(() => !!props.editData?.id)

const dialogTitle = computed(() => isEdit.value ? '编辑任务' : '新建任务')

const formData = reactive({
  name: '',
  description: '',
  status: 'active',
  priority: 'medium'
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

watch(() => props.visible, (val) => {
  if (val && props.editData) {
    Object.assign(formData, {
      name: props.editData.name || '',
      description: props.editData.description || '',
      status: props.editData.status || 'active',
      priority: props.editData.priority || 'medium'
    })
  }
})

watch(() => props.editData, (data) => {
  if (data) {
    Object.assign(formData, {
      name: data.name || '',
      description: data.description || '',
      status: data.status || 'active',
      priority: data.priority || 'medium'
    })
  }
}, { deep: true })

function handleCancel() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true

  const submitData = {
    name: formData.name,
    description: formData.description,
    status: formData.status as Todo['status'],
    priority: formData.priority as Todo['priority']
  }

  emit('submit', submitData, () => {
    submitting.value = false
    handleCancel()
  })
}

function handleClosed() {
  formRef.value?.resetFields()
  Object.assign(formData, {
    name: '',
    description: '',
    status: 'active',
    priority: 'medium'
  })
}
</script>

<style lang="scss" scoped>
.todo-form {
  .el-textarea__inner {
    resize: vertical;
  }

  .el-radio-group {
    display: flex;
    gap: $spacing-6;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;
}
</style>
