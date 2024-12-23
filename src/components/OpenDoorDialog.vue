<template>
  <el-dialog
    title="Door Control"
    v-model="visible"
    width="400px"
    :close-on-click-modal="false"
  >
    <div class="door-control-content">
      <!-- 场景选择 -->
      <el-radio-group v-model="doorType" class="door-type-selector">
        <el-radio-button label="staff">Staff</el-radio-button>
        <el-radio-button label="customer">Customer</el-radio-button>
        <el-radio-button label="auto">Auto</el-radio-button>
      </el-radio-group>

      <!-- 员工开门场景 -->
      <div v-if="doorType === 'staff'" class="staff-access">
        <el-alert
          type="info"
          :closable="false"
          class="access-info"
        >
          Quick access for staff members
        </el-alert>
        <el-button 
          type="primary" 
          class="quick-open-btn"
          :loading="loading"
          @click="handleStaffAccess"
        >
          Open Door
        </el-button>
      </div>

      <!-- 客户开门场景 -->
      <div v-else-if="doorType === 'customer'" class="customer-access">
        <!-- 进场/离场选择 -->
        <el-radio-group v-model="accessType" class="access-type-selector">
          <el-radio-button label="entry">Entry</el-radio-button>
          <el-radio-button label="exit">Exit</el-radio-button>
        </el-radio-group>

        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="License Plate" prop="licensePlate">
            <el-input 
              v-model="form.licensePlate" 
              placeholder="Enter license plate number"
              @keyup.enter="handleCustomerAccess"
            />
          </el-form-item>
        </el-form>
        
        <!-- 最近使用的车牌号 -->
        <div class="recent-plates" v-if="recentPlates.length">
          <p class="recent-title">Recent Plates:</p>
          <div class="plates-list">
            <el-tag
              v-for="plate in recentPlates"
              :key="plate"
              class="plate-tag"
              @click="selectPlate(plate)"
            >
              {{ plate }}
            </el-tag>
          </div>
        </div>

        <!-- 预约/停车信息展示区域 -->
        <div v-if="reservationInfo" class="reservation-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Customer">
              {{ reservationInfo.customerName }}
            </el-descriptions-item>
            
            <!-- 进场信息 -->
            <template v-if="accessType === 'entry'">
              <el-descriptions-item label="Scheduled Time">
                {{ reservationInfo.scheduledTime }}
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(reservationInfo.status)">
                  {{ reservationInfo.status }}
                </el-tag>
              </el-descriptions-item>
              
              <!-- 提前进场警告 -->
              <template v-if="reservationInfo.isEarly">
                <el-descriptions-item label="Early Entry">
                  <el-alert
                    type="warning"
                    :closable="false"
                    show-icon
                  >
                    Customer is arriving {{ reservationInfo.earlyMinutes }} minutes early
                  </el-alert>
                </el-descriptions-item>
              </template>
              
              <!-- 车位占用警告 -->
              <template v-if="reservationInfo.isSpaceOccupied">
                <el-descriptions-item label="Space Status">
                  <el-alert
                    type="error"
                    :closable="false"
                    show-icon
                  >
                    Assigned space #{{ reservationInfo.spaceNumber }} is still occupied
                  </el-alert>
                </el-descriptions-item>
              </template>
            </template>
            
            <!-- 离场信息 -->
            <template v-else>
              <el-descriptions-item label="Entry Time">
                {{ reservationInfo.entryTime }}
              </el-descriptions-item>
              <el-descriptions-item label="Parking Duration">
                {{ reservationInfo.parkingDuration }}
              </el-descriptions-item>
              
              <!-- 超时信息 -->
              <template v-if="reservationInfo.isOvertime">
                <el-descriptions-item label="Overtime">
                  <el-alert
                    type="warning"
                    :closable="false"
                    show-icon
                  >
                    Exceeded by {{ reservationInfo.overtimeMinutes }} minutes
                  </el-alert>
                </el-descriptions-item>
                <el-descriptions-item label="Overtime Fee">
                  <span class="overtime-fee">${{ reservationInfo.overtimeFee }}</span>
                </el-descriptions-item>
              </template>
              
              <!-- 支付状态和操作 -->
              <el-descriptions-item label="Payment Status">
                <template v-if="reservationInfo.paymentStatus === 'Unpaid'">
                  <el-tag type="danger">Unpaid</el-tag>
                  <el-button 
                    type="primary" 
                    size="small" 
                    class="pay-button"
                    :loading="paymentLoading"
                    @click="handlePayment"
                  >
                    Pay Now
                  </el-button>
                </template>
                <el-tag v-else type="success">Paid</el-tag>
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </div>
      </div>

      <!-- 自动开门场景 -->
      <div v-else class="auto-access">
        <el-alert
          type="info"
          :closable="false"
          class="access-info"
        >
          Automatic door control via license plate recognition
        </el-alert>
        
        <!-- 自动开门状态显示 -->
        <div class="auto-status">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Status">
              <el-tag :type="autoModeEnabled ? 'success' : 'info'">
                {{ autoModeEnabled ? 'Enabled' : 'Disabled' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Last Action">
              {{ lastAutoAction || 'No recent activity' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 自动开门控制 -->
        <div class="auto-controls">
          <el-switch
            v-model="autoModeEnabled"
            :loading="loading"
            @change="handleAutoModeChange"
            active-text="Enable Auto Mode"
            inactive-text="Disable Auto Mode"
          />
        </div>

        <!-- 自动开门日志 -->
        <div class="auto-logs" v-if="autoLogs.length">
          <p class="logs-title">Recent Activities:</p>
          <el-timeline>
            <el-timeline-item
              v-for="log in autoLogs"
              :key="log.time"
              :timestamp="log.time"
              :type="log.type"
            >
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">Close</el-button>
        <el-button 
          v-if="doorType === 'customer'"
          type="primary" 
          @click="handleCustomerAccess" 
          :loading="loading"
        >
          Verify & Open
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const doorType = ref('staff')
const reservationInfo = ref(null)

// 表单数据
const form = reactive({
  licensePlate: ''
})

// 表单验证规则
const rules = {
  licensePlate: [
    { required: true, message: 'Please enter license plate number', trigger: 'blur' },
    { min: 5, max: 10, message: 'Length should be 5 to 10 characters', trigger: 'blur' }
  ]
}

// 最近使用的车牌号
const recentPlates = ref(['CA 1234', 'NY 5678', 'TX 9012'])

// 选择车牌号
const selectPlate = (plate) => {
  form.licensePlate = plate
  checkReservation(plate)
}

// 添加进场/离场状态
const accessType = ref('entry')

// 修改检查预约信息方法
const checkReservation = async (licensePlate) => {
  try {
    loading.value = true
    // TODO: 根据进场/离场类型调用不同的API
    const response = await (accessType.value === 'entry' 
      ? checkEntryReservation(licensePlate)
      : checkExitStatus(licensePlate))
    
    reservationInfo.value = response
  } catch (error) {
    ElMessage.error('Failed to fetch vehicle information')
  } finally {
    loading.value = false
  }
}

// 模拟进场预约检查
const checkEntryReservation = async (licensePlate) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        customerName: 'John Doe',
        scheduledTime: '2024-03-20 14:30',
        status: 'Early',
        isEarly: true,
        earlyMinutes: 30,
        spaceNumber: 'A123',
        isSpaceOccupied: true,
        licensePlate
      })
    }, 500)
  })
}

// 模拟离场状态检查
const checkExitStatus = async (licensePlate) => {
  // 模拟API调用
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        customerName: 'John Doe',
        entryTime: '2024-03-20 12:30',
        parkingDuration: '2 hours',
        isOvertime: true,
        overtimeMinutes: 45,
        overtimeFee: 15.00,
        paymentStatus: 'Unpaid',
        licensePlate
      })
    }, 500)
  })
}

// 员工开门处理
const handleStaffAccess = async () => {
  try {
    loading.value = true
    // TODO: 调用员工开门API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('Door opened for staff access')
    visible.value = false
  } catch (error) {
    ElMessage.error('Failed to open door')
  } finally {
    loading.value = false
  }
}

// 客户开门处理
const handleCustomerAccess = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await checkReservation(form.licensePlate)
    
    if (accessType.value === 'entry') {
      // 进场验证
      if (reservationInfo.value?.status === 'Invalid') {
        throw new Error('Invalid reservation')
      }
      
      // 提前进场或车位占用时需要确认
      if (reservationInfo.value?.isEarly || reservationInfo.value?.isSpaceOccupied) {
        await ElMessageBox.confirm(
          'There are warnings for this entry. Are you sure to proceed?',
          'Warning',
          {
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }
        )
      }
    } else {
      // 离场验证
      if (reservationInfo.value?.paymentStatus !== 'Paid') {
        throw new Error('Payment required before exit')
      }
    }
    
    // TODO: 调用开门API
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(`Door opened for ${accessType.value === 'entry' ? 'entry' : 'exit'}: ${form.licensePlate}`)
    
    // 更新最近使用的车牌号
    if (!recentPlates.value.includes(form.licensePlate)) {
      recentPlates.value.unshift(form.licensePlate)
      if (recentPlates.value.length > 5) {
        recentPlates.value.pop()
      }
    }
    
    visible.value = false
  } catch (error) {
    if (error?.message === 'cancel') return
    ElMessage.error(error.message || 'Failed to open door')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.licensePlate = ''
  reservationInfo.value = null
  doorType.value = 'staff'
  accessType.value = 'entry'
  lastAutoAction.value = ''
}

// 添加自动开门相关的状态
const autoModeEnabled = ref(false)
const lastAutoAction = ref('')
const autoLogs = ref([
  {
    time: '2024-03-20 14:30',
    type: 'success',
    message: 'Auto opened for vehicle: CA 1234'
  },
  {
    time: '2024-03-20 14:25',
    type: 'warning',
    message: 'Unrecognized plate detected'
  }
])

// 处理自动模式切换
const handleAutoModeChange = async (value) => {
  try {
    loading.value = true
    // TODO: 调用后端API启用/禁用自动开门
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    lastAutoAction.value = value 
      ? 'Auto mode enabled at ' + new Date().toLocaleTimeString()
      : 'Auto mode disabled at ' + new Date().toLocaleTimeString()
    
    ElMessage.success(`Auto mode ${value ? 'enabled' : 'disabled'} successfully`)
  } catch (error) {
    ElMessage.error('Failed to change auto mode')
    autoModeEnabled.value = !value // 恢复开关状态
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  show: () => {
    visible.value = true
    resetForm()
  }
})

const paymentLoading = ref(false)

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'Valid': return 'success'
    case 'Early': return 'warning'
    case 'Invalid': return 'danger'
    default: return 'info'
  }
}

// 处理支付
const handlePayment = async () => {
  try {
    paymentLoading.value = true
    // TODO: 调用支付API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新支付状态
    reservationInfo.value.paymentStatus = 'Paid'
    ElMessage.success('Payment successful')
  } catch (error) {
    ElMessage.error('Payment failed')
  } finally {
    paymentLoading.value = false
  }
}
</script>

<style scoped>
.door-control-content {
  padding: 20px 0;
}

.door-type-selector {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.staff-access {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.access-info {
  width: 100%;
  margin-bottom: 20px;
}

.quick-open-btn {
  width: 200px;
  height: 40px;
}

.customer-access {
  padding: 0 20px;
}

.recent-plates {
  margin-top: 20px;
}

.recent-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.plates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.plate-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.plate-tag:hover {
  background-color: var(--el-color-primary-light-7);
}

.reservation-info {
  margin-top: 20px;
  padding: 16px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.auto-access {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auto-status {
  margin-top: 20px;
}

.auto-controls {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.auto-logs {
  margin-top: 20px;
}

.logs-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.access-type-selector {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.overtime-fee {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.pay-button {
  margin-left: 12px;
}
</style> 