<template>
  <div class="rfid-config">
    <el-form ref="formRef" :model="config" :rules="rules" label-width="160px">
      <!-- 基本配置 -->
      <h4 class="config-section">Basic Configuration</h4>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Frequency" prop="frequency">
            <el-select v-model="config.frequency">
              <el-option label="900 MHz" value="900MHz" />
              <el-option label="2.4 GHz" value="2.4GHz" />
              <el-option label="13.56 MHz" value="13.56MHz" />
              <el-option label="125 KHz" value="125KHz" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Read Range" prop="readRange">
            <el-input-number 
              v-model="config.readRange" 
              :min="0.1" 
              :max="10"
              :step="0.1"
              controls-position="right"
            >
              <template #suffix>m</template>
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 协议配置 -->
      <h4 class="config-section">Protocol Settings</h4>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="RFID Protocol" prop="rfidProtocol">
            <el-select 
              v-model="config.rfidProtocol"
              multiple
              placeholder="Select protocols"
            >
              <el-option label="EPC Gen2" value="EPCGen2" />
              <el-option label="ISO 18000-6C" value="ISO18000-6C" />
              <el-option label="ISO 14443" value="ISO14443" />
              <el-option label="ISO 15693" value="ISO15693" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Tag Capacity" prop="tagCapacity">
            <el-input-number 
              v-model="config.tagCapacity"
              :min="1"
              :max="1000"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 高级设置 -->
      <h4 class="config-section">Advanced Settings</h4>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Anti-Collision" prop="antiCollision">
            <el-switch v-model="config.antiCollision" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Trigger Mode" prop="triggerMode">
            <el-select v-model="config.triggerMode">
              <el-option label="Auto" value="auto" />
              <el-option label="Manual" value="manual" />
              <el-option label="External" value="external" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Read Timeout" prop="readTimeout">
            <el-input-number 
              v-model="config.readTimeout"
              :min="100"
              :max="5000"
              :step="100"
              controls-position="right"
            >
              <template #suffix>ms</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Power Level" prop="powerLevel">
            <el-slider 
              v-model="config.powerLevel"
              :min="0"
              :max="30"
              :step="1"
              show-input
            >
              <template #suffix>dBm</template>
            </el-slider>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { RFIDConfig } from '@/types/device'

const props = defineProps<{
  modelValue: RFIDConfig
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: RFIDConfig): void
}>()

const formRef = ref<FormInstance>()

// 默认配置
const defaultConfig: RFIDConfig = {
  name: '',
  enabled: true,
  frequency: '900MHz',
  readRange: 1,
  rfidProtocol: ['EPCGen2'],
  tagCapacity: 100,
  antiCollision: true,
  triggerMode: 'auto',
  readTimeout: 1000,
  powerLevel: 20
}

const config = ref<RFIDConfig>({
  ...defaultConfig,
  ...props.modelValue
})

// 监听配置变化
watch(
  () => config.value,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)

const rules = {
  frequency: [
    { required: true, message: 'Please select frequency', trigger: 'change' }
  ],
  readRange: [
    { required: true, message: 'Please enter read range', trigger: 'blur' }
  ],
  rfidProtocol: [
    { required: true, message: 'Please select at least one protocol', trigger: 'change' }
  ],
  tagCapacity: [
    { required: true, message: 'Please enter tag capacity', trigger: 'blur' }
  ],
  triggerMode: [
    { required: true, message: 'Please select trigger mode', trigger: 'change' }
  ],
  readTimeout: [
    { required: true, message: 'Please enter read timeout', trigger: 'blur' }
  ],
  powerLevel: [
    { required: true, message: 'Please set power level', trigger: 'change' }
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

<style scoped>
.config-section {
  margin: 20px 0 16px;
  padding-left: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
}
</style> 