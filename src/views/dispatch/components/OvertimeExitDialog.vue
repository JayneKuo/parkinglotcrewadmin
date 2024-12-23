<template>
  <el-dialog
    v-model="dialogVisible"
    title="Overtime Exit"
    width="500px"
  >
    <div class="info-section">
      <div class="section-title">Parking Information</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Vehicle Plate</span>
          <span class="value">{{ spot?.vehiclePlate }}</span>
        </div>
        <div class="info-item">
          <span class="label">Entry Time</span>
          <span class="value">{{ spot?.entryTime }}</span>
        </div>
        <div class="info-item">
          <span class="label">Duration</span>
          <span class="value">{{ formatDuration(spot?.duration || 0) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Overtime</span>
          <span class="value overtime">{{ formatDuration(spot?.overtime || 0) }}</span>
        </div>
      </div>
    </div>

    <div class="payment-section">
      <div class="section-title">Payment Details</div>
      <div class="amount-info">
        <div class="amount-row">
          <span>Regular Fee</span>
          <span>${{ calculateRegularFee() }}</span>
        </div>
        <div class="amount-row">
          <span>Overtime Fee</span>
          <span class="overtime">${{ calculateOvertimeFee() }}</span>
        </div>
        <div class="amount-row total">
          <span>Total Amount</span>
          <span>${{ calculateTotalFee() }}</span>
        </div>
      </div>

      <el-form :model="form" label-position="top">
        <el-form-item label="Payment Method">
          <el-radio-group v-model="form.paymentMethod">
            <el-radio label="cash">Cash</el-radio>
            <el-radio label="card">Credit Card</el-radio>
            <el-radio label="sms">SMS Payment</el-radio>
          </el-radio-group>
        </el-form-item>

        <template v-if="form.paymentMethod === 'cash'">
          <el-form-item label="Received Amount">
            <el-input-number 
              v-model="form.receivedAmount"
              :min="Number(calculateTotalFee())"
              :precision="2"
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          <div class="change-info" v-if="form.receivedAmount > 0">
            <span>Change:</span>
            <span class="change-amount">${{ calculateChange() }}</span>
          </div>
        </template>

        <template v-if="form.paymentMethod === 'card'">
          <div class="qr-section">
            <div class="qr-code">
              <el-image src="/qr-placeholder.jpg" />
            </div>
            <p class="qr-hint">Scan QR code to complete payment</p>
          </div>
        </template>

        <template v-if="form.paymentMethod === 'sms'">
          <el-form-item label="Phone Number">
            <el-input 
              v-model="form.phoneNumber"
              placeholder="Enter phone number"
            >
              <template #append>
                <el-button 
                  type="primary" 
                  :disabled="!isValidPhone || smsSent"
                  @click="handleSendSMS"
                >
                  {{ smsSent ? `Resend(${countdown}s)` : 'Send SMS' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </template>

        <el-form-item label="Notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="Add payment notes"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="warning" @click="handleSkipPayment">
          Skip Payment
        </el-button>
        <el-button 
          type="primary" 
          @click="handleConfirmPayment" 
          :loading="loading"
          :disabled="!canConfirmPayment"
        >
          Confirm Payment & Exit
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  spot: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: any): void
  (e: 'skip', data: any): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const form = ref({
  paymentMethod: 'cash',
  receivedAmount: 0,
  phoneNumber: '',
  notes: ''
})

// 格式化时间
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

// 计算费用
const calculateRegularFee = () => {
  const regularHours = Math.min(props.spot?.duration || 0, 120) / 60
  return (regularHours * 10).toFixed(2)
}

const calculateOvertimeFee = () => {
  const overtimeHours = props.spot?.overtime ? props.spot.overtime / 60 : 0
  return (overtimeHours * 15).toFixed(2)
}

const calculateTotalFee = () => {
  const regular = parseFloat(calculateRegularFee())
  const overtime = parseFloat(calculateOvertimeFee())
  return (regular + overtime).toFixed(2)
}

// 计算找零
const calculateChange = () => {
  if (!form.value.receivedAmount) return '0.00'
  const change = form.value.receivedAmount - parseFloat(calculateTotalFee())
  return change.toFixed(2)
}

// 短信相关
const smsSent = ref(false)
const countdown = ref(60)
let timer: number | null = null

const isValidPhone = computed(() => {
  return /^[0-9]{10}$/.test(form.value.phoneNumber)
})

const handleSendSMS = async () => {
  try {
    smsSent.value = true
    startCountdown()
    ElMessage.success('Payment link sent successfully')
  } catch (error) {
    ElMessage.error('Failed to send payment link')
  }
}

const startCountdown = () => {
  countdown.value = 60
  timer = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      smsSent.value = false
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }, 1000)
}

// 判断是否可以确认支付
const canConfirmPayment = computed(() => {
  switch (form.value.paymentMethod) {
    case 'cash':
      return form.value.receivedAmount >= parseFloat(calculateTotalFee())
    case 'card':
      return true
    case 'sms':
      return smsSent.value
    default:
      return false
  }
})

// 按钮事件处理
const handleCancel = () => {
  dialogVisible.value = false
}

const handleSkipPayment = () => {
  emit('skip', {
    spotId: props.spot?.id,
    notes: form.value.notes
  })
  dialogVisible.value = false
}

const handleConfirmPayment = async () => {
  loading.value = true
  try {
    emit('confirm', {
      spotId: props.spot?.id,
      amount: calculateTotalFee(),
      ...form.value
    })
    dialogVisible.value = false
  } finally {
    loading.value = false
  }
}

// 清理定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped lang="scss">
.info-section,
.payment-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 13px;
      color: #6b7280;
    }

    .value {
      font-size: 14px;
      font-weight: 500;

      &.overtime {
        color: #dc2626;
      }
    }
  }
}

.amount-info {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  .amount-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;

    &:last-child {
      margin-bottom: 0;
    }

    &.total {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #e5e7eb;
      font-weight: 600;
      font-size: 16px;
    }

    .overtime {
      color: #dc2626;
    }
  }
}

.change-info {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f0f9eb;
  border-radius: 4px;

  .change-amount {
    font-weight: 600;
    color: #67c23a;
  }
}

.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;

  .qr-code {
    width: 200px;
    height: 200px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    :deep(img) {
      width: 100%;
      height: 100%;
    }
  }

  .qr-hint {
    margin-top: 12px;
    color: #606266;
    font-size: 14px;
  }
}
</style> 