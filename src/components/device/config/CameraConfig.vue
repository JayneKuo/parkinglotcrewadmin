<template>
  <div class="camera-config">
    <el-form 
      ref="formRef"
      :model="config"
      :rules="rules"
      label-width="160px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Resolution" prop="resolution">
            <el-select v-model="config.resolution">
              <el-option label="720p" value="720p" />
              <el-option label="1080p" value="1080p" />
              <el-option label="4K" value="4K" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Frame Rate" prop="fps">
            <el-input-number 
              v-model="config.fps" 
              :min="1" 
              :max="60"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Night Vision" prop="nightVision">
            <el-switch v-model="config.nightVision" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Motion Detection" prop="motionDetection">
            <el-switch v-model="config.motionDetection" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Storage Retention" prop="storageRetentionDays">
            <el-input-number 
              v-model="config.storageRetentionDays"
              :min="1"
              :max="90"
              controls-position="right"
            >
              <template #suffix>Days</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CameraConfig } from '@/types/device'

const props = defineProps<{
  modelValue: CameraConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CameraConfig): void
}>()

const config = ref<CameraConfig>({
  ...props.modelValue
})

const rules = {
  resolution: [
    { required: true, message: 'Please select resolution', trigger: 'change' }
  ],
  fps: [
    { required: true, message: 'Please enter frame rate', trigger: 'blur' }
  ],
  storageRetentionDays: [
    { required: true, message: 'Please enter storage retention days', trigger: 'blur' }
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