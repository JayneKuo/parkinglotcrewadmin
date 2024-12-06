<template>
  <div class="driver-edit">
    <el-page-header @back="$router.back()">
      <template #content>Edit Driver</template>
    </el-page-header>

    <div class="form-container">
      <driver-form 
        v-if="driverData" 
        v-model="driverData" 
        :is-edit="true"
        @submit="handleSubmit" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Driver } from '@/types/driver'
import { mockDrivers } from '@/mock/driver'
import DriverForm from './components/DriverForm.vue'

const route = useRoute()
const router = useRouter()
const driverData = ref<Driver>()

// 加载司机数据
const loadDriver = () => {
  const id = route.params.id as string
  const driver = mockDrivers.find(d => d.id === id)
  if (driver) {
    driverData.value = { ...driver }
  } else {
    ElMessage.error('Driver not found')
    router.push('/driver')
  }
}

// 提交编辑
const handleSubmit = async (data: Driver) => {
  try {
    const index = mockDrivers.findIndex(d => d.id === data.id)
    if (index > -1) {
      mockDrivers[index] = {
        ...data,
        updatedAt: new Date().toISOString()
      }
      ElMessage.success('Driver updated successfully')
      router.push('/driver')
    }
  } catch (error) {
    ElMessage.error('Failed to update driver')
  }
}

onMounted(() => {
  loadDriver()
})
</script>

<style scoped>
.driver-edit {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  max-width: 1200px;
}
</style> 