<template>
  <el-dialog
    title="Create Reservation"
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
      class="reservation-form"
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
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="Enter email address" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Plate No." prop="plateNo">
              <el-input v-model="form.plateNo" placeholder="Enter plate number" />
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
            <el-form-item label="Space Type" prop="spaceType">
              <el-select 
                v-model="form.spaceType" 
                placeholder="Select space type"
                filterable
                style="width: 100%"
                @change="handleSpaceTypeChange"
              >
                <el-option label="Standard" value="standard" />
                <el-option label="Large Vehicle" value="large" />
                <el-option label="Valet" value="valet" />
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

        <el-form-item label="Time Range" prop="timeRange" required>
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="to"
            start-placeholder="Start time"
            end-placeholder="End time"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            style="width: 100%"
            @change="handleTimeChange"
          />
        </el-form-item>

        <el-form-item label="Quantity" prop="quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            :max="maxQuantity"
            style="width: 200px"
            controls-position="right"
            placeholder="Enter quantity"
          />
        </el-form-item>
      </div>

      <!-- Notes -->
      <div class="form-section">
        <h3>Notes</h3>
        <el-form-item label="Notes">
          <el-input 
            v-model="form.notes"
            type="textarea"
            rows="3"
            placeholder="Enter additional notes (optional)"
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

  <!-- Payment Dialog -->
  <el-dialog
    v-model="paymentDialogVisible"
    title="Payment"
    width="650px"
    :close-on-click-modal="false"
    class="payment-dialog"
  >
    <div class="payment-info">
      <div class="order-summary">
        <h4>Order Summary</h4>
        <div class="summary-item">
          <span class="label">Order No:</span>
          <span class="value">{{ currentOrder?.orderNo }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Amount:</span>
          <span class="value amount">${{ currentOrder?.amount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="payment-methods">
        <h4>Select Payment Method</h4>
        <div 
          v-for="method in paymentMethods" 
          :key="method.value"
          class="payment-method-item"
          :class="{ active: selectedPaymentMethod === method.value }"
          @click="selectedPaymentMethod = method.value"
        >
          <div class="method-icon">
            <el-icon><component :is="method.icon" /></el-icon>
          </div>
          <div class="method-info">
            <div class="method-name">{{ method.label }}</div>
            <div class="method-desc">{{ method.description }}</div>
          </div>
          <div class="method-check">
            <el-icon v-show="selectedPaymentMethod === method.value">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handlePaymentCancel">Cancel</el-button>
        <el-button 
          type="primary" 
          :loading="paymentLoading"
          :disabled="!selectedPaymentMethod"
          @click="handlePaymentConfirm"
        >
          {{ getPaymentButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'created'])

// Form reference
const formRef = ref<FormInstance>()
const loading = ref(false)
const paymentDialogVisible = ref(false)
const paymentLoading = ref(false)
const selectedPaymentMethod = ref('')
const currentOrder = ref<CreateReservationResponse | null>(null)

// Default time
const defaultTime = [
  new Date(2000, 1, 1, 8, 0, 0),
  new Date(2000, 1, 1, 18, 0, 0),
]

// Parking lot options
const parkingLots = [
  { label: 'Downtown Parking', value: 'downtown' },
  { label: 'Airport Parking', value: 'airport' },
  { label: 'Mall Parking', value: 'mall' }
]

// Payment methods
const paymentMethods = [
  { 
    label: 'Credit Card',
    value: 'credit_card',
    icon: 'CreditCard',
    description: 'Pay with credit or debit card'
  },
  { 
    label: 'Cash',
    value: 'cash',
    icon: 'Money',
    description: 'Pay with cash'
  },
  { 
    label: 'Mobile Payment',
    value: 'mobile',
    icon: 'Cellphone',
    description: 'Pay with mobile wallet'
  },
  { 
    label: 'Bank Transfer',
    value: 'bank',
    icon: 'Bank',
    description: 'Pay via bank transfer'
  },
  {
    label: 'Email Payment Link',
    value: 'email_link',
    icon: 'Message',
    description: 'Receive payment link via email'
  },
  {
    label: 'SMS Payment Link',
    value: 'sms_link',
    icon: 'ChatDotRound',
    description: 'Receive payment link via SMS'
  },
  {
    label: 'No Payment Required',
    value: 'no_payment',
    icon: 'CircleCheck',
    description: 'Free reservation or payment waived'
  }
]

// 可用车位列表
const availableSpaces = ref<Array<{label: string, value: string}>>([])
const maxQuantity = ref(1)

// Form data
const form = reactive({
  customerName: '',
  phone: '',
  email: '',
  plateNo: '',
  parkingLot: '',
  spaceType: 'standard',
  zoneName: '',
  spaceNo: '',
  quantity: 1,
  timeRange: null,
  notes: ''
})

// Form validation rules
const rules: FormRules = {
  customerName: [
    { required: true, message: 'Please enter customer name', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'Please enter phone number', trigger: 'blur' },
    { 
      pattern: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
      message: 'Please enter a valid US phone number (e.g. (123) 456-7890)',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: 'Please enter email address', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  plateNo: [
    { required: true, message: 'Please enter plate number', trigger: 'blur' }
  ],
  parkingLot: [
    { required: true, message: 'Please select parking lot', trigger: 'change' }
  ],
  spaceType: [
    { required: true, message: 'Please select space type', trigger: 'change' }
  ],
  zoneName: [
    { required: true, message: 'Please select zone', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: 'Please select time range', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: 'Please enter quantity', trigger: 'change' },
    { type: 'number', min: 1, message: 'Quantity must be greater than 0', trigger: 'change' }
  ]
}

// 添加手机号格式化函数
const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}

// 修改手机号输入处理
const handlePhoneInput = (value: string) => {
  // 移除所有非数字字符
  const cleaned = value.replace(/\D/g, '')
  // 限制长度为10位
  if (cleaned.length > 10) {
    form.phone = formatPhoneNumber(cleaned.slice(0, 10))
  } else {
    form.phone = formatPhoneNumber(cleaned)
  }
}

// 处理停车场选择变化
const handleParkingLotChange = () => {
  form.zoneName = ''
  form.spaceNo = ''
  form.quantity = 1
  availableSpaces.value = []
  // TODO: 根据选择的停车场加载区域列表
}

// 处理区域选择变化
const handleZoneChange = () => {
  form.spaceNo = ''
  form.quantity = 1
  // TODO: 根据选择的区域加载可用车位
  // 模拟数据
  availableSpaces.value = Array.from({ length: 10 }, (_, i) => ({
    label: `Space ${i + 1}`,
    value: `${i + 1}`
  }))
}

// 处理车位类型变化
const handleSpaceTypeChange = () => {
  form.zoneName = ''
  form.spaceNo = ''
  form.quantity = 1
  availableSpaces.value = []
  // TODO: 根据车位类型重置相关字段
}

// 处理时间变化
const handleTimeChange = async () => {
  if (!form.timeRange || !form.zoneName) return
  
  try {
    const [startTime, endTime] = form.timeRange as string[]
    
    // 使用模拟验证
    const validationResult = await mockValidateReservation({
      parkingLot: form.parkingLot,
      spaceType: form.spaceType,
      zoneName: form.zoneName,
      quantity: form.quantity,
      startTime,
      endTime
    })

    if (validationResult.available) {
      // 更新可用车位
      maxQuantity.value = validationResult.availableQuantity || 1
      // 更新可用车位列表
      handleZoneChange()
    } else {
      ElMessage.warning(validationResult.message || 'Selected time period is not available')
      form.timeRange = null
    }
  } catch (error: any) {
    console.error('Failed to validate time range:', error)
    if (error.response?.data) {
      const errorData = error.response.data as ApiError
      ElMessage.warning(errorData.message)
    } else {
      ElMessage.error('Failed to check availability')
    }
  }
}

// 添加验证场景计数器
const validationScenarioCount = ref(0)

// 模拟不同的验证场景
const mockValidationScenarios = [
  {
    code: 'SPACE_NOT_AVAILABLE',
    message: 'Selected space is not available for the chosen time',
    available: false
  },
  {
    code: 'INSUFFICIENT_QUANTITY',
    message: 'Insufficient parking spaces',
    available: false,
    details: {
      availableQuantity: 2
    }
  },
  {
    code: 'TIME_CONFLICT',
    message: 'Selected time period conflicts with existing reservations',
    available: false,
    details: {
      conflictTimes: ['2024-02-15 10:00:00 - 2024-02-15 12:00:00']
    }
  },
  {
    code: 'INVALID_TIME_RANGE',
    message: 'Selected time range is invalid (minimum 1 hour, maximum 24 hours)',
    available: false
  },
  {
    // 最后一个场景是成功的
    code: 'SUCCESS',
    message: 'Validation successful',
    available: true,
    availableQuantity: 5
  }
]

// 添加模拟验证函数
const mockValidateReservation = async (data: ValidateReservationRequest): Promise<ValidationResult> => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const currentScenario = mockValidationScenarios[validationScenarioCount.value]
  
  if (!currentScenario.available) {
    // 模拟错误响应
    throw {
      response: {
        data: {
          code: currentScenario.code,
          message: currentScenario.message,
          details: currentScenario.details
        }
      }
    }
  }
  
  // 返回成功结果
  return {
    available: true,
    availableQuantity: currentScenario.availableQuantity || 5,
    message: currentScenario.message
  }
}

// 添加路由导入
import { useRouter } from 'vue-router'

// 添加订单状态枚举
enum ReservationStatus {
  Pending = 1,
  AwaitingUse = 2,
  Used = 3,
  Cancelled = 4,
  Refunded = 5,
  Expired = 6,
  PaymentFailed = 7,
  RefundFailed = 8,
  RefundRequested = 9,
  RefundInProcess = 10,
  Overdue = 11
}

// 获取路由实例
const router = useRouter()

// 修改模拟创建订单函数
const mockCreateReservation = async (data: any) => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 生成订单号
  const orderNo = 'R' + new Date().getTime().toString().slice(-8)
  
  // 模拟创建成功响应
  return {
    id: Math.random().toString(36).slice(2),
    orderNo,
    status: ReservationStatus.Pending, // 默认待支付状态
    amount: Math.floor(Math.random() * 50) + 20,
    createdAt: new Date().toISOString()
  }
}

// 修改支付确认函数
const handlePaymentConfirm = async () => {
  if (!selectedPaymentMethod.value || !currentOrder.value) {
    ElMessage.warning('Please select payment method')
    return
  }

  try {
    paymentLoading.value = true
    
    switch (selectedPaymentMethod.value) {
      case 'email_link':
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success(`Payment link has been sent to ${form.email}`)
        // 跳转到订单详情页，状态为待支付
        navigateToDetail(currentOrder.value.id, ReservationStatus.Pending)
        break
        
      case 'sms_link':
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success(`Payment link has been sent to ${form.phone}`)
        // 跳转到订单详情页，状态为待支付
        navigateToDetail(currentOrder.value.id, ReservationStatus.Pending)
        break
        
      case 'no_payment':
        await new Promise(resolve => setTimeout(resolve, 500))
        ElMessage.success('Reservation confirmed without payment')
        // 跳转到订单详情页，状态为待使用
        navigateToDetail(currentOrder.value.id, ReservationStatus.AwaitingUse)
        break
        
      default:
        // 其他支付方式
        await mockPayReservation({
          orderId: currentOrder.value.id,
          paymentMethod: selectedPaymentMethod.value
        })
        ElMessage.success('Payment successful')
        // 跳转到订单详情页，状态为待使用
        navigateToDetail(currentOrder.value.id, ReservationStatus.AwaitingUse)
    }
    
    paymentDialogVisible.value = false
    emit('created')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Payment failed:', error)
    ElMessage.error('Payment failed, please try again')
  } finally {
    paymentLoading.value = false
  }
}

// 添加跳转到详情页的函数
const navigateToDetail = (id: string, status: ReservationStatus) => {
  // 更新订单状态
  if (currentOrder.value) {
    currentOrder.value.status = status
  }
  
  // 跳转到详情页
  router.push({
    path: `/reservation/detail/${id}`,
    query: {
      status: status.toString(),
      from: 'create'
    }
  })
}

// 修改支付取消处理
const handlePaymentCancel = () => {
  ElMessageBox.confirm(
    'Are you sure to cancel the payment? The reservation will be cancelled.',
    'Cancel Payment',
    {
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      type: 'warning'
    }
  ).then(() => {
    paymentDialogVisible.value = false
    emit('update:modelValue', false)
    // 如果已创建订单，跳转到详情页并显示已取消状态
    if (currentOrder.value) {
      navigateToDetail(currentOrder.value.id, ReservationStatus.Cancelled)
    }
    ElMessage.warning('Reservation cancelled')
  }).catch(() => {
    // User clicked No, do nothing
  })
}

// 添加模拟支付函数
const mockPayReservation = async (data: { orderId: string, paymentMethod: string }) => {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟支付成功
  return true
}

// 修改表单提交函数
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    const [startTime, endTime] = form.timeRange || []
    
    // 先校验预订
    const validationData = {
      parkingLot: form.parkingLot,
      spaceType: form.spaceType,
      zoneName: form.zoneName,
      spaceNo: form.spaceNo,
      quantity: form.quantity,
      startTime: startTime || '',
      endTime: endTime || ''
    }

    try {
      // 使用模拟校验
      const validationResult = await mockValidateReservation(validationData)
      
      if (validationResult.available) {
        // 如果是最后一个成功场景，创建预约
        const submitData = {
          customerName: form.customerName,
          phone: form.phone.replace(/\D/g, ''),
          email: form.email,
          plateNo: form.plateNo,
          ...validationData
        }

        try {
          // 使用模拟创建订单
          const result = await mockCreateReservation(submitData)
          currentOrder.value = result
          
          // 显示支付对话框
          paymentDialogVisible.value = true
          ElMessage.success('Reservation created successfully')
        } catch (error) {
          ElMessage.error('Failed to create reservation')
        }
      } else {
        ElMessage.warning(validationResult.message || 'Selected space is not available')
      }
      
    } catch (error: any) {
      if (error.response?.data) {
        const errorData = error.response.data as ApiError
        
        switch (errorData.code) {
          case 'SPACE_NOT_AVAILABLE':
            ElMessage.warning(errorData.message)
            break
          case 'INSUFFICIENT_QUANTITY':
            maxQuantity.value = errorData.details?.availableQuantity || 1
            ElMessage.warning(`Only ${maxQuantity.value} spaces available`)
            break
          case 'TIME_CONFLICT':
            ElMessage.warning(`Time conflict: ${errorData.details?.conflictTimes?.join(', ')}`)
            break
          case 'INVALID_TIME_RANGE':
            ElMessage.warning(errorData.message)
            break
          default:
            ElMessage.error(errorData.message || 'Failed to create reservation')
        }
      } else {
        ElMessage.error('Failed to create reservation, please try again')
      }
    } finally {
      // 增加场景计数
      validationScenarioCount.value = (validationScenarioCount.value + 1) % mockValidationScenarios.length
    }
    
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    loading.value = false
  }
}

// 添加默认数据填充函数
const fillMockData = () => {
  // 生成随机的客户名
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  // 生成随机的车牌号
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const randomLetters = Array(3).fill(0).map(() => letters[Math.floor(Math.random() * letters.length)]).join('')
  const randomNumbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  // 生成随机的时间范围（今天开始，持续8小时）
  const today = new Date()
  const startTime = new Date(today.setHours(8, 0, 0, 0))
  const endTime = new Date(startTime.getTime() + 8 * 60 * 60 * 1000)

  // 填充表单数据
  Object.assign(form, {
    customerName: `${randomFirstName} ${randomLastName}`,
    phone: '(123) 456-7890',
    email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
    plateNo: `${randomLetters}${randomNumbers}`,
    parkingLot: 'downtown',
    spaceType: 'standard',
    zoneName: 'A',
    spaceNo: '101',
    quantity: 1,
    timeRange: [
      startTime.toISOString().slice(0, 19),
      endTime.toISOString().slice(0, 19)
    ],
    notes: 'Test reservation'
  })

  // 触发相关的变化处理函数
  handleParkingLotChange()
  handleSpaceTypeChange()
  handleZoneChange()
  handleTimeChange()
}

// 修改对话框打开处理函数
const handleDialogOpen = () => {
  fillMockData()
  // 重置场景计数器
  validationScenarioCount.value = 0
}

// 修改支付对话框的按钮文本
const getPaymentButtonText = computed(() => {
  switch (selectedPaymentMethod.value) {
    case 'email_link':
      return 'Send Email'
    case 'sms_link':
      return 'Send SMS'
    case 'no_payment':
      return 'Confirm'
    default:
      return 'Confirm Payment'
  }
})
</script>

<style scoped lang="scss">
.reservation-form {
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

.payment-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
  
  .payment-info {
    .order-summary {
      background-color: var(--el-fill-color-light);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 28px;

      h4 {
        margin: 0 0 20px;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .label {
          color: var(--el-text-color-secondary);
          font-size: 14px;
        }
        
        .value {
          font-weight: 500;
          
          &.amount {
            color: var(--el-color-success);
            font-size: 20px;
          }
        }
      }
    }

    .payment-methods {
      h4 {
        margin: 0 0 20px;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .payment-method-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        margin-bottom: 16px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;

        &:hover {
          border-color: var(--el-color-primary-light-5);
          background-color: var(--el-color-primary-light-9);
        }

        &.active {
          border-color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        .method-icon {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background-color: var(--el-color-primary-light-8);
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 22px;
            color: var(--el-color-primary);
          }
        }

        .method-info {
          flex: 1;
          min-width: 0;

          .method-name {
            font-size: 15px;
            font-weight: 500;
            margin-bottom: 6px;
            color: var(--el-text-color-primary);
          }

          .method-desc {
            font-size: 13px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }

        .method-check {
          position: absolute;
          top: 20px;
          right: 20px;
          color: var(--el-color-primary);
          font-size: 18px;
        }
      }
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

:deep(.el-form-item) {
  margin-bottom: 22px;

  .el-form-item__error {
    padding-top: 4px;
    line-height: 1.4;
    position: absolute;
    top: 100%;
    left: 0;
  }
}

:deep(.el-select) {
  width: 100%;
  
  .el-input {
    width: 100%;
  }
  
  .el-select__tags {
    max-width: calc(100% - 30px);
  }
}

:deep(.el-input-number) {
  width: 200px;
  
  .el-input__wrapper {
    padding-right: 82px !important;
  }
  
  .el-input-number__decrease,
  .el-input-number__increase {
    width: 40px;
    
    .el-icon {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style> 