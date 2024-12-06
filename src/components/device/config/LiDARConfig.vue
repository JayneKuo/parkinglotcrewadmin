<template>
  <div class="lidar-config">
    <el-form 
      ref="formRef"
      :model="config"
      :rules="rules"
      label-width="160px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Scan Frequency" prop="scanFrequency">
            <el-input-number 
              v-model="config.scanFrequency" 
              :min="1" 
              :max="100"
              controls-position="right"
            >
              <template #suffix>Hz</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Range Resolution" prop="rangeResolution">
            <el-input-number 
              v-model="config.rangeResolution" 
              :min="0.1" 
              :max="10"
              :step="0.1"
              controls-position="right"
            >
              <template #suffix>mm</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Angular Resolution" prop="angularResolution">
            <el-input-number 
              v-model="config.angularResolution"
              :min="0.1"
              :max="1"
              :step="0.1"
              controls-position="right"
            >
              <template #suffix>°</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Detection Range" prop="detectionRange">
            <el-input-number 
              v-model="config.detectionRange"
              :min="1"
              :max="100"
              controls-position="right"
            >
              <template #suffix>m</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Point Density" prop="pointDensity">
            <el-input-number 
              v-model="config.pointDensity"
              :min="10"
              :max="1000"
              :step="10"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'
import type { LiDARConfig } from '@/types/device'

const props = defineProps<{
  modelValue: LiDARConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: LiDARConfig): void
}>()

const formRef = ref<FormInstance>()

const config = ref<LiDARConfig>({
  ...props.modelValue
})

const rules = {
  scanFrequency: [
    { required: true, message: 'Please enter scan frequency', trigger: 'blur' }
  ],
  rangeResolution: [
    { required: true, message: 'Please enter range resolution', trigger: 'blur' }
  ],
  angularResolution: [
    { required: true, message: 'Please enter angular resolution', trigger: 'blur' }
  ],
  detectionRange: [
    { required: true, message: 'Please enter detection range', trigger: 'blur' }
  ],
  pointDensity: [
    { required: true, message: 'Please enter point density', trigger: 'blur' }
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