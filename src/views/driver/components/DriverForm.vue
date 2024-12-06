<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
    <!-- 基本信息 -->
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>Basic Information</span>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" placeholder="Enter driver name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="form.phone" placeholder="Enter phone number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Email">
            <el-input v-model="form.email" type="email" placeholder="Enter email address" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="License" prop="licenseNumber">
            <el-input v-model="form.licenseNumber" placeholder="Enter license number" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Membership" prop="membershipType">
            <el-select v-model="form.membershipType" placeholder="Select membership type">
              <el-option
                v-for="type in membershipTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Expiry Date" v-if="form.membershipType !== MembershipType.None">
            <el-date-picker
              v-model="form.membershipExpiry"
              type="date"
              placeholder="Select expiry date"
              :disabled-date="disabledDate"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 车辆信息 -->
    <el-card class="mb-4">
      <template #header>
        <div class="card-header">
          <span>Vehicle Information</span>
          <el-button type="primary" link @click="addVehicle">
            <el-icon><Plus /></el-icon>Add Vehicle
          </el-button>
        </div>
      </template>

      <div v-for="(vehicle, index) in form.vehicleInfo" :key="index" class="vehicle-item">
        <div class="vehicle-header">
          <span>Vehicle #{{ index + 1 }}</span>
          <el-button type="danger" link @click="removeVehicle(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="index === 0 ? 'Plate Number' : ''" :prop="`vehicleInfo.${index}.plateNumber`">
              <el-input v-model="vehicle.plateNumber" placeholder="Enter plate number" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="index === 0 ? 'Make' : ''" :prop="`vehicleInfo.${index}.make`">
              <el-input v-model="vehicle.make" placeholder="Enter vehicle make" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="index === 0 ? 'Model' : ''" :prop="`vehicleInfo.${index}.model`">
              <el-input v-model="vehicle.model" placeholder="Enter vehicle model" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item :label="index === 0 ? 'Year' : ''" :prop="`vehicleInfo.${index}.year`">
              <el-input-number v-model="vehicle.year" :min="1990" :max="new Date().getFullYear() + 1" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="index === 0 ? 'Color' : ''" :prop="`vehicleInfo.${index}.color`">
              <el-input v-model="vehicle.color" placeholder="Enter vehicle color" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 表单操作 -->
    <div class="form-actions">
      <el-button @click="$router.back()">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Submit</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { Driver, VehicleInfo } from '@/types/driver'
import { MembershipType } from '@/types/driver'

const props = defineProps<{
  modelValue: Partial<Driver>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<Driver>): void
  (e: 'submit', value: Driver): void
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = ref<Partial<Driver>>({
  ...props.modelValue,
  vehicleInfo: props.modelValue?.vehicleInfo || [],
  membershipType: MembershipType.None // 设置默认会员类型
})

// 会员类型选项
const membershipTypes = [
  { label: 'None', value: MembershipType.None },
  { label: 'Regular', value: MembershipType.Regular },
  { label: 'Premium', value: MembershipType.Premium },
  { label: 'VIP', value: MembershipType.VIP }
]

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now()
}

// 添加车辆
const addVehicle = () => {
  form.value.vehicleInfo = form.value.vehicleInfo || []
  form.value.vehicleInfo.push({
    plateNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: ''
  })
}

// 移除车辆
const removeVehicle = (index: number) => {
  form.value.vehicleInfo?.splice(index, 1)
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: 'Please enter driver name', trigger: 'blur' },
    { min: 2, max: 50, message: 'Length should be 2 to 50 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { pattern: /^\(\d{3}\) \d{3}-\d{4}$/, message: 'Invalid phone number format', trigger: 'blur' }
  ],
  licenseNumber: [
    { required: true, message: 'Please enter license number', trigger: 'blur' }
  ],
  membershipType: [
    { required: true, message: 'Please select membership type', trigger: 'change' }
  ],
  'vehicleInfo.*.plateNumber': [
    { required: true, message: 'Please enter plate number', trigger: 'blur' }
  ],
  'vehicleInfo.*.make': [
    { required: true, message: 'Please enter vehicle make', trigger: 'blur' }
  ],
  'vehicleInfo.*.model': [
    { required: true, message: 'Please enter vehicle model', trigger: 'blur' }
  ]
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      // 设置默认支付信息
      const data = {
        ...form.value,
        paymentInfo: {
          balance: 0,
          autoRecharge: false
        }
      }
      emit('submit', data as Driver)
    }
  })
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-item {
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>