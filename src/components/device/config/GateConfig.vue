<template>
  <div class="gate-config">
    <el-form 
      ref="formRef"
      :model="config"
      :rules="rules"
      label-width="160px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Operation Mode" prop="operationMode">
            <el-select v-model="config.operationMode">
              <el-option label="Automatic" value="automatic" />
              <el-option label="Manual" value="manual" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Open Duration" prop="openDuration">
            <el-input-number 
              v-model="config.openDuration" 
              :min="1" 
              :max="30"
              controls-position="right"
            >
              <template #suffix>Seconds</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Obstacle Detection" prop="obstacleDetection">
            <el-switch v-model="config.obstacleDetection" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Auto Close" prop="autoClose">
            <el-switch v-model="config.autoClose" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Emergency Mode" prop="emergencyMode">
            <el-select v-model="config.emergencyMode">
              <el-option label="Open" value="open" />
              <el-option label="Close" value="close" />
              <el-option label="Maintain" value="maintain" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import type { GateConfig } from '@/types/device'

const props = defineProps<{
  modelValue: GateConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GateConfig): void
}>()

const formRef = ref<FormInstance>()

const config = ref<GateConfig>({
  ...props.modelValue
})

const rules = {
  operationMode: [
    { required: true, message: 'Please select operation mode', trigger: 'change' }
  ],
  openDuration: [
    { required: true, message: 'Please enter open duration', trigger: 'blur' }
  ],
  emergencyMode: [
    { required: true, message: 'Please select emergency mode', trigger: 'change' }
  ]
}

// 验证并获取配置
const validate = async () => {
  if (!formRef.value) return false
  return await formRef.value.validate()
}

// 获取配置数据
const getConfig = () => {
  return config.value
}

defineExpose({
  validate,
  getConfig
})
</script> 