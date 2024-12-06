<template>
  <div class="rfid-config">
    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="180px"
    >
      <!-- 工作频率 -->
      <el-form-item label="Operating Frequency" prop="frequency">
        <el-select v-model="form.frequency" placeholder="Select frequency">
          <el-option label="900 MHz" value="900MHz" />
          <el-option label="2.4 GHz" value="2.4GHz" />
        </el-select>
      </el-form-item>

      <!-- 天线数量 -->
      <el-form-item label="Number of Antennas" prop="antennaCount">
        <el-input-number 
          v-model="form.antennaCount"
          :min="1"
          :max="4"
          placeholder="Enter antenna count"
        />
      </el-form-item>

      <!-- 识别范围 -->
      <el-form-item label="Recognition Range (m)" prop="recognitionRange">
        <el-input-number 
          v-model="form.recognitionRange"
          :min="1"
          :max="20"
          :precision="1"
          placeholder="Enter recognition range"
        />
      </el-form-item>

      <!-- 协议支持 -->
      <el-form-item label="Supported Protocols" prop="protocols">
        <el-select 
          v-model="form.protocols"
          multiple
          placeholder="Select protocols"
        >
          <el-option label="ISO/IEC 18000-6C" value="ISO18000-6C" />
          <el-option label="ISO/IEC 18000-6B" value="ISO18000-6B" />
          <el-option label="EPC Class1 Gen2" value="EPCGen2" />
        </el-select>
      </el-form-item>

      <!-- 读取速度 -->
      <el-form-item label="Reading Speed (tags/s)" prop="readingSpeed">
        <el-input-number 
          v-model="form.readingSpeed"
          :min="10"
          :max="200"
          placeholder="Enter reading speed"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 表单数据
const form = ref({
  frequency: '',
  antennaCount: 2,
  recognitionRange: 10,
  protocols: ['ISO18000-6C'],
  readingSpeed: 50
})

// 验证规则
const rules: FormRules = {
  frequency: [
    { required: true, message: 'Please select operating frequency', trigger: 'change' }
  ],
  antennaCount: [
    { required: true, message: 'Please enter antenna count', trigger: 'blur' },
    { type: 'number', min: 1, max: 4, message: 'Value should be between 1 and 4', trigger: 'blur' }
  ],
  recognitionRange: [
    { required: true, message: 'Please enter recognition range', trigger: 'blur' },
    { type: 'number', min: 1, max: 20, message: 'Value should be between 1 and 20 meters', trigger: 'blur' }
  ],
  protocols: [
    { required: true, message: 'Please select at least one protocol', trigger: 'change' },
    { type: 'array', min: 1, message: 'Please select at least one protocol', trigger: 'change' }
  ],
  readingSpeed: [
    { required: true, message: 'Please enter reading speed', trigger: 'blur' },
    { type: 'number', min: 10, max: 200, message: 'Value should be between 10 and 200 tags/second', trigger: 'blur' }
  ]
}

// 表单引用
const formRef = ref<FormInstance>()

// 暴露方法给父组件
defineExpose({
  validate: async () => {
    if (!formRef.value) return false
    return await formRef.value.validate()
  },
  getConfig: () => form.value
})
</script>

<style scoped lang="scss">
.rfid-config {
  padding: 20px;
  
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}
</style> 