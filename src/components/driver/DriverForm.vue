<template>
  <el-form 
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
  >
    <!-- 基本信息 -->
    <div class="form-section">
      <h3>Basic Information</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Phone" prop="phone">
            <el-input v-model="form.phone" />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Email" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="License" prop="licenseNumber">
            <el-input v-model="form.licenseNumber" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 会员信息 -->
    <div class="form-section">
      <h3>Membership</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Type" prop="membershipType">
            <el-select v-model="form.membershipType">
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
          <el-form-item 
            label="Expiry Date" 
            prop="membershipExpiry"
            v-if="form.membershipType !== MembershipType.None"
          >
            <el-date-picker
              v-model="form.membershipExpiry"
              type="date"
              placeholder="Select date"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <!-- 车辆信息 -->
    <div class="form-section">
      <h3>Vehicles</h3>
      <div 
        v-for="(vehicle, index) in form.vehicleInfo" 
        :key="index"
        class="vehicle-form"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item 
              :label="index === 0 ? 'Plate Number' : ''"
              :prop="`vehicleInfo.${index}.plateNumber`"
            >
              <el-input v-model="vehicle.plateNumber" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="index === 0 ? 'Make' : ''">
              <el-input v-model="vehicle.make" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item :label="index === 0 ? 'Model' : ''">
              <el-input v-model="vehicle.model" />
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button 
              type="danger" 
              link
              :icon="Delete"
              @click="removeVehicle(index)"
            />
          </el-col>
        </el-row>
      </div>
      <el-button type="primary" plain @click="addVehicle">
        <el-icon><Plus /></el-icon>Add Vehicle
      </el-button>
    </div>

    <!-- 支付信息 -->
    <div class="form-section">
      <h3>Payment Settings</h3>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Auto Recharge">
            <el-switch v-model="form.paymentInfo.autoRecharge" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { DriverStatus, MembershipType, type Driver } from '@/types/driver'

const props = defineProps<{
  initialData?: Partial<Driver>
}>()

// 表单引用
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  email: '',
  licenseNumber: '',
  membershipType: MembershipType.None,
  membershipExpiry: '',
  vehicleInfo: [{
    plateNumber: '',
    make: '',
    model: '',
    color: '',
    type: ''
  }],
  paymentInfo: {
    autoRecharge: false
  }
})

// 会员类型选项
const membershipTypes = [
  { label: 'None', value: MembershipType.None },
  { label: 'Regular', value: MembershipType.Regular },
  { label: 'Premium', value: MembershipType.Premium },
  { label: 'Corporate', value: MembershipType.Corporate }
]

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: 'Please enter name', trigger: 'blur' },
    { min: 2, max: 50, message: 'Length should be 2 to 50 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { pattern: /^\d{10}$/, message: 'Please enter valid phone number', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: 'Please enter valid email address', trigger: 'blur' }
  ],
  licenseNumber: [
    { required: true, message: 'Please enter license number', trigger: 'blur' }
  ],
  'vehicleInfo.0.plateNumber': [
    { required: true, message: 'Please enter plate number', trigger: 'blur' }
  ]
}

// 添加车辆
const addVehicle = () => {
  form.vehicleInfo.push({
    plateNumber: '',
    make: '',
    model: '',
    color: '',
    type: ''
  })
}

// 移除车辆
const removeVehicle = (index: number) => {
  if (form.vehicleInfo.length > 1) {
    form.vehicleInfo.splice(index, 1)
  }
}

// 初始化表单数据
if (props.initialData) {
  Object.assign(form, props.initialData)
}

defineExpose({
  formRef,
  form
})
</script>

<style scoped lang="scss">
.form-section {
  margin-bottom: 32px;

  h3 {
    margin: 0 0 20px;
    padding-left: 12px;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }
}

.vehicle-form {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 4px;

  &:not(:first-child) {
    margin-top: 16px;
  }
}
</style> 