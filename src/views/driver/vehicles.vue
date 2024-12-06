<template>
  <div class="driver-vehicles">
    <el-page-header @back="$router.back()">
      <template #content>Vehicle Management - {{ driver?.name }}</template>
    </el-page-header>

    <el-card class="vehicle-list">
      <template #header>
        <div class="card-header">
          <span>Vehicles</span>
          <el-button type="primary" @click="showAddForm = true">
            <el-icon><Plus /></el-icon>Add Vehicle
          </el-button>
        </div>
      </template>

      <el-table :data="driver?.vehicleInfo || []" border>
        <el-table-column prop="plateNumber" label="Plate Number" width="150" />
        <el-table-column prop="make" label="Make" width="150" />
        <el-table-column prop="model" label="Model" width="150" />
        <el-table-column prop="year" label="Year" width="100" />
        <el-table-column prop="color" label="Color" width="120" />
        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="danger" link @click="handleDelete($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加车辆表单 -->
    <el-dialog
      v-model="showAddForm"
      title="Add Vehicle"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="vehicleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="Plate Number" prop="plateNumber">
          <el-input v-model="vehicleForm.plateNumber" placeholder="Enter plate number" />
        </el-form-item>
        <el-form-item label="Make" prop="make">
          <el-input v-model="vehicleForm.make" placeholder="Enter vehicle make" />
        </el-form-item>
        <el-form-item label="Model" prop="model">
          <el-input v-model="vehicleForm.model" placeholder="Enter vehicle model" />
        </el-form-item>
        <el-form-item label="Year" prop="year">
          <el-input-number
            v-model="vehicleForm.year"
            :min="1990"
            :max="new Date().getFullYear() + 1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="Color" prop="color">
          <el-input v-model="vehicleForm.color" placeholder="Enter vehicle color" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddForm = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit">Add</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { Driver, VehicleInfo } from '@/types/driver'
import { mockDrivers } from '@/mock/driver'

const route = useRoute()
const router = useRouter()

// 司机数据
const driver = ref<Driver>()

// 表单显示控制
const showAddForm = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const vehicleForm = ref<VehicleInfo>({
  plateNumber: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: ''
})

// 表单验证规则
const rules = {
  plateNumber: [
    { required: true, message: 'Please enter plate number', trigger: 'blur' }
  ],
  make: [
    { required: true, message: 'Please enter vehicle make', trigger: 'blur' }
  ],
  model: [
    { required: true, message: 'Please enter vehicle model', trigger: 'blur' }
  ],
  year: [
    { required: true, message: 'Please select year', trigger: 'change' }
  ],
  color: [
    { required: true, message: 'Please enter vehicle color', trigger: 'blur' }
  ]
}

// 加载司机数据
const loadDriver = () => {
  const id = route.params.id as string
  const found = mockDrivers.find(d => d.id === id)
  if (found) {
    driver.value = { ...found }
  } else {
    ElMessage.error('Driver not found')
    router.push('/driver')
  }
}

// 添加车辆
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid && driver.value) {
      // 添加车辆
      driver.value.vehicleInfo = driver.value.vehicleInfo || []
      driver.value.vehicleInfo.push({ ...vehicleForm.value })
      
      // 更新司机信息
      const index = mockDrivers.findIndex(d => d.id === driver.value?.id)
      if (index > -1) {
        mockDrivers[index] = {
          ...driver.value,
          updatedAt: new Date().toISOString()
        }
      }

      ElMessage.success('Vehicle added successfully')
      showAddForm.value = false
      
      // 重置表单
      vehicleForm.value = {
        plateNumber: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: ''
      }
    }
  })
}

// 删除车辆
const handleDelete = (index: number) => {
  if (!driver.value?.vehicleInfo) return
  
  driver.value.vehicleInfo.splice(index, 1)
  
  // 更新司机信息
  const driverIndex = mockDrivers.findIndex(d => d.id === driver.value?.id)
  if (driverIndex > -1) {
    mockDrivers[driverIndex] = {
      ...driver.value,
      updatedAt: new Date().toISOString()
    }
  }
  
  ElMessage.success('Vehicle removed successfully')
}

onMounted(() => {
  loadDriver()
})
</script>

<style scoped>
.driver-vehicles {
  padding: 20px;
}

.vehicle-list {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 