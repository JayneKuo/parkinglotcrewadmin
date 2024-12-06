<template>
  <el-dialog
    title="Create Valet Order"
    :model-value="modelValue"
    width="800px"
    @update:model-value="$emit('update:modelValue', $event)"
    @open="handleDialogOpen"
  >
    <el-form 
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      class="valet-form"
    >
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Basic Information</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Customer Name" prop="customerName">
              <el-input v-model="form.customerName" placeholder="Enter customer name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phone" prop="phone">
              <el-input 
                v-model="form.phone" 
                placeholder="Enter phone number (e.g. (123) 456-7890)"
                @input="handlePhoneInput"
                maxlength="14"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Vehicle Information -->
      <div class="form-section">
        <h3>Vehicle Information</h3>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="Plate No." prop="plateNo">
              <el-input v-model="form.plateNo" placeholder="Enter plate number" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Car Model" prop="carModel">
              <el-input v-model="form.carModel" placeholder="Enter car model" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Car Color" prop="carColor">
              <el-input v-model="form.carColor" placeholder="Enter car color" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- Parking Information -->
      <div class="form-section">
        <h3>Parking Information</h3>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Parking Lot" prop="parkingLot">
              <el-select 
                v-model="form.parkingLot" 
                placeholder="Select parking lot"
                filterable
                style="width: 100%"
                @change="handleParkingLotChange"
              >
                <el-option
                  v-for="lot in parkingLots"
                  :key="lot.value"
                  :label="lot.label"
                  :value="lot.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Service Type" prop="serviceType">
              <el-select 
                v-model="form.serviceType" 
                placeholder="Select service type"
                style="width: 100%"
              >
                <el-option label="Standard" value="standard" />
                <el-option label="Premium" value="premium" />
                <el-option label="VIP" value="vip" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Zone" prop="zoneName">
              <el-select 
                v-model="form.zoneName" 
                placeholder="Select zone"
                filterable
                style="width: 100%"
                @change="handleZoneChange"
              >
                <el-option label="Zone A" value="A" />
                <el-option label="Zone B" value="B" />
                <el-option label="Zone C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Space No." prop="spaceNo">
              <el-select 
                v-model="form.spaceNo" 
                placeholder="Select space"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="space in availableSpaces"
                  :key="space.value"
                  :label="space.label"
                  :value="space.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Start Time" prop="startTime" required>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="Select start time"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            style="width: 100%"
            @change="handleTimeChange"
          />
        </el-form-item>
      </div>

      <!-- Driver Assignment -->
      <div class="form-section">
        <h3>Driver Assignment</h3>
        <el-form-item label="Valet Driver" prop="driverId">
          <el-select
            v-model="form.driverId"
            placeholder="Select driver"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            >
              <div class="driver-option">
                <span>{{ driver.name }}</span>
                <span class="driver-phone">{{ driver.phone }}</span>
                <div class="driver-rating">
                  <el-rate
                    v-model="driver.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                  />
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </div>

      <!-- Notes -->
      <div class="form-section">
        <h3>Notes</h3>
        <el-form-item label="Special Instructions">
          <el-input 
            v-model="form.notes"
            type="textarea"
            rows="3"
            placeholder="Enter any special instructions or notes"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">Create</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ValetStatus, ValetSource } from '@/types/valet'

// Props & Emits
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'created'])

// Form reference
const formRef = ref<FormInstance>()
const loading = ref(false)

// Form data
const form = reactive({
  customerName: '',
  phone: '',
  plateNo: '',
  carModel: '',
  carColor: '',
  parkingLot: '',
  serviceType: 'standard',
  zoneName: '',
  spaceNo: '',
  startTime: '',
  driverId: '',
  notes: ''
})

// Validation rules
const rules: FormRules = {
  customerName: [
    { required: true, message: 'Please enter customer name', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { 
      pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      message: 'Please enter a valid US phone number',
      trigger: 'blur'
    }
  ],
  plateNo: [
    { required: true, message: 'Please enter plate number', trigger: 'blur' }
  ],
  carModel: [
    { required: true, message: 'Please enter car model', trigger: 'blur' }
  ],
  carColor: [
    { required: true, message: 'Please enter car color', trigger: 'blur' }
  ],
  parkingLot: [
    { required: true, message: 'Please select parking lot', trigger: 'change' }
  ],
  serviceType: [
    { required: true, message: 'Please select service type', trigger: 'change' }
  ],
  zoneName: [
    { required: true, message: 'Please select zone', trigger: 'change' }
  ],
  spaceNo: [
    { required: true, message: 'Please select space', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: 'Please select start time', trigger: 'change' }
  ],
  driverId: [
    { required: true, message: 'Please select driver', trigger: 'change' }
  ]
}

// Mock data
const parkingLots = [
  { label: 'Downtown Parking', value: 'downtown' },
  { label: 'Airport Parking', value: 'airport' },
  { label: 'Mall Parking', value: 'mall' }
]

// Phone number formatting
const handlePhoneInput = (value: string) => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length > 10) {
    form.phone = formatPhoneNumber(cleaned.slice(0, 10))
  } else {
    form.phone = formatPhoneNumber(cleaned)
  }
}

const formatPhoneNumber = (phone: string) => {
  const match = phone.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// 可用车位列表
const availableSpaces = ref<Array<{label: string, value: string}>>([])

// 默认时间
const defaultTime = new Date().setHours(8, 0, 0, 0)

// 泊车员列表
const availableDrivers = ref([
  {
    id: 'D001',
    name: 'Tom Wilson',
    phone: '(111) 222-3333',
    rating: 4.8,
    status: 'available'
  },
  {
    id: 'D002',
    name: 'Jack Brown',
    phone: '(222) 333-4444',
    rating: 4.9,
    status: 'available'
  }
  // ... 更多泊车员
])

// 处理函数
const handleParkingLotChange = () => {
  form.zoneName = ''
  form.spaceNo = ''
  // TODO: 根据停车场加载区域列表
}

const handleZoneChange = () => {
  form.spaceNo = ''
  // 模拟加载可用车位
  availableSpaces.value = Array.from({ length: 10 }, (_, i) => ({
    label: `Space ${i + 1}`,
    value: `${i + 1}`
  }))
}

const handleTimeChange = () => {
  // TODO: 根据时间检查车位和泊车员可用性
}

// Form submission
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 创建泊车订单
    const order = {
      id: Math.random().toString(36).slice(2),
      orderNo: `V${new Date().getTime()}`,
      customerName: form.customerName,
      phone: form.phone.replace(/\D/g, ''),
      plateNo: form.plateNo,
      carModel: form.carModel,
      carColor: form.carColor,
      parkingLot: form.parkingLot,
      zoneName: form.zoneName,
      spaceNo: form.spaceNo,
      serviceType: form.serviceType,
      startTime: form.startTime,
      driverId: form.driverId,
      driverName: availableDrivers.value.find(d => d.id === form.driverId)?.name,
      notes: form.notes,
      status: ValetStatus.Reserved, // 设置为预约成功状态
      source: ValetSource.Offline,
      createdAt: new Date().toISOString()
    }

    emit('created', order)
    emit('update:modelValue', false)
    ElMessage.success('Valet order created successfully')
    
  } catch (error) {
    console.error('Failed to create valet order:', error)
    ElMessage.error('Failed to create valet order')
  } finally {
    loading.value = false
  }
}

// Fill mock data on dialog open
const handleDialogOpen = () => {
  Object.assign(form, {
    customerName: 'John Smith',
    phone: '(123) 456-7890',
    plateNo: 'ABC123',
    carModel: 'Tesla Model 3',
    carColor: 'White',
    parkingLot: 'downtown',
    serviceType: 'standard',
    zoneName: 'A',
    spaceNo: '1',
    startTime: '2023-05-01 10:00:00',
    driverId: 'D001',
    notes: 'Test valet order'
  })
}
</script>

<style scoped lang="scss">
.valet-form {
  .form-section {
    margin-bottom: 24px;
    
    h3 {
      margin: 0 0 20px;
      padding-left: 12px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      border-left: 3px solid var(--el-color-primary);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.driver-option {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .driver-phone {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }
  
  .driver-rating {
    margin-left: auto;
  }
}
</style> 