<template>
  <el-dialog
    v-model="dialogVisible"
    title="Vehicle Entry"
    width="400px"
  >
    <el-form :model="form" label-position="top" :rules="rules" ref="formRef">
      <el-form-item label="Vehicle Plate" prop="plate">
        <el-input v-model="form.plate" placeholder="Enter plate number" />
      </el-form-item>

      <el-form-item label="Notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="Add entry notes"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">
          Confirm Entry
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  spot: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = ref({
  plate: '',
  notes: ''
})

const rules = {
  plate: [{ required: true, message: 'Please enter plate number', trigger: 'blur' }]
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    emit('confirm', {
      spotId: props.spot?.id,
      ...form.value
    })
    
    dialogVisible.value = false
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    loading.value = false
  }
}

watch(() => dialogVisible.value, (newVal) => {
  if (!newVal) {
    form.value = {
      plate: '',
      notes: ''
    }
    formRef.value?.resetFields()
  }
})
</script>

<style scoped>
.mt-2 {
  margin-top: 8px;
}
</style> 