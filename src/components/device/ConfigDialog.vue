<template>
  <el-dialog
    v-model="visible"
    :title="'Configure ' + device?.name"
    width="600px"
  >
    <component
      :is="getConfigComponent(device?.type)"
      ref="configRef"
    />
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        Save
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Device } from '@/types/device'
import RFIDConfig from './RFIDConfig.vue'

const props = defineProps<{
  modelValue: boolean
  device?: Device
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const configRef = ref()
const saving = ref(false)

// 获取对应的配置组件
const getConfigComponent = (type?: string) => {
  switch (type) {
    case 'rfid':
      return RFIDConfig
    default:
      return null
  }
}

// 保存配置
const handleSave = async () => {
  if (!configRef.value) return

  try {
    await configRef.value.validate()
    saving.value = true
    
    // 获取配置数据
    const config = configRef.value.getConfig()
    console.log('Config saved:', config)
    
    ElMessage.success('Configuration saved successfully')
    emit('saved')
    visible.value = false
  } catch (error) {
    ElMessage.error('Please check the form')
  } finally {
    saving.value = false
  }
}
</script> 