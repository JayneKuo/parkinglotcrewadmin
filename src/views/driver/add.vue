<template>
  <div class="driver-add">
    <el-page-header @back="$router.back()">
      <template #content>Add Driver</template>
    </el-page-header>

    <div class="form-container">
      <driver-form v-model="driverForm" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Driver } from '@/types/driver'
import { mockCreateDriver } from '@/mock/driver'
import DriverForm from '@/views/driver/components/DriverForm.vue'

const router = useRouter()
const driverForm = ref<Partial<Driver>>({})

const handleSubmit = async (data: Driver) => {
  try {
    // 使用模拟API创建司机
    await mockCreateDriver(data)
    ElMessage.success('Driver added successfully')
    router.push('/driver')
  } catch (error) {
    ElMessage.error('Failed to add driver')
  }
}
</script>

<style scoped>
.driver-add {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  max-width: 1200px;
}
</style> 