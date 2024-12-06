<template>
  <div class="reservation-container">
    <!-- Search Form -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Order No.">
          <el-input v-model="searchForm.orderNo" placeholder="Enter order number" clearable />
        </el-form-item>
        <el-form-item label="Customer">
          <el-input v-model="searchForm.customerName" placeholder="Name/Phone" clearable />
        </el-form-item>
        <el-form-item label="Parking Lot">
          <el-select 
            v-model="searchForm.parkingLot" 
            clearable 
            placeholder="Select parking lot"
            style="width: 220px"
          >
            <el-option
              v-for="lot in parkingLots"
              :key="lot.value"
              :label="lot.label"
              :value="lot.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Space Type">
          <el-select 
            v-model="searchForm.spaceType" 
            clearable 
            placeholder="Select type"
            style="width: 180px"
          >
            <el-option label="Standard" value="standard" />
            <el-option label="Large Vehicle" value="large" />
            <el-option label="Valet" value="valet" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-select 
            v-model="searchForm.status" 
            clearable 
            placeholder="Select status"
            style="width: 200px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Date Range">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Reservation List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>Reservation List</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              New Reservation
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              Export
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="reservationList" 
        border 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="Order No." width="160" fixed />
        <el-table-column prop="customerName" label="Customer" width="120" />
        <el-table-column prop="phone" label="Phone" width="120" />
        <el-table-column prop="plateNo" label="Plate No." width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.plateNo }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="parkingLot" label="Parking Lot" min-width="150" show-overflow-tooltip />
        <el-table-column prop="spaceType" label="Space Location" width="180">
          <template #default="{ row }">
            <div class="space-location">
              <!-- 区域信息 -->
              <el-tag type="info" v-if="row.zoneName">
                Zone {{ row.zoneName }}
              </el-tag>
              <!-- 车位信息 -->
              <el-tag v-if="row.spaceNo" :type="getSpaceTypeTag(row.spaceType)" class="ml-2">
                Space {{ row.spaceNo }}
              </el-tag>
              <!-- 未分配车位时显示车位类型 -->
              <template v-if="!row.spaceNo">
                <el-tag :type="getSpaceTypeTag(row.spaceType)">
                  {{ formatSpaceType(row.spaceType) }}
                </el-tag>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created At" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Reservation Time" width="300">
          <template #default="{ row }">
            <div class="time-info">
              <div>
                <el-icon><Calendar /></el-icon>
                Start: {{ formatDateTime(row.startTime) }}
              </div>
              <div>
                <el-icon><Calendar /></el-icon>
                End: {{ formatDateTime(row.endTime) }}
              </div>
              <div>
                <el-icon><Timer /></el-icon>
                Duration: {{ formatDuration(row.duration) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="Amount" width="120">
          <template #default="{ row }">
            <span class="amount">${{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ statusMap[row.status] }}
              <template v-if="row.status === ReservationStatus.Overdue">
                <br>
                <small>({{ formatDuration(row.overdueMinutes || 0) }})</small>
              </template>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="100" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button type="primary" link>
                Actions<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- Pending Payment -->
                  <template v-if="row.status === ReservationStatus.Pending">
                    <el-dropdown-item @click="handleConfirmPayment(row)">
                      <el-icon><Check /></el-icon>Confirm Payment
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleCancel(row)">
                      <el-icon><Close /></el-icon>Cancel
                    </el-dropdown-item>
                  </template>

                  <!-- Payment Failed -->
                  <template v-if="row.status === ReservationStatus.PaymentFailed">
                    <el-dropdown-item @click="handleRetryPayment(row)">
                      <el-icon><RefreshRight /></el-icon>Retry Payment
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleCancel(row)">
                      <el-icon><Close /></el-icon>Cancel
                    </el-dropdown-item>
                  </template>

                  <!-- AwaitingUse -->
                  <template v-if="row.status === ReservationStatus.AwaitingUse">
                    <el-dropdown-item @click="handleCheckIn(row)">
                      <el-icon><Van /></el-icon>Check In
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleRefund(row)">
                      <el-icon><Money /></el-icon>Request Refund
                    </el-dropdown-item>
                  </template>

                  <!-- InUse -->
                  <template v-if="row.status === ReservationStatus.InUse">
                    <el-dropdown-item @click="handleCheckOut(row)">
                      <el-icon><Van /></el-icon>Check Out
                    </el-dropdown-item>
                  </template>

                  <!-- Overdue -->
                  <template v-if="row.status === ReservationStatus.Overdue">
                    <el-dropdown-item @click="handleCheckOut(row)">
                      <el-icon><Timer /></el-icon>
                      Check Out (Overdue: {{ formatDuration(row.overdueMinutes || 0) }})
                    </el-dropdown-item>
                  </template>

                  <!-- Used -->
                  <template v-if="row.status === ReservationStatus.Used">
                    <el-dropdown-item @click="handleRefund(row)">
                      <el-icon><Money /></el-icon>Request Refund
                    </el-dropdown-item>
                  </template>

                  <!-- RefundFailed -->
                  <template v-if="row.status === ReservationStatus.RefundFailed">
                    <el-dropdown-item @click="handleRetryRefund(row)">
                      <el-icon><RefreshRight /></el-icon>Retry Refund
                    </el-dropdown-item>
                  </template>

                  <!-- View Detail - Always Show -->
                  <el-dropdown-item @click="handleView(row)">
                    <el-icon><View /></el-icon>View Details
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Refund Dialog -->
    <RefundDialog
      v-model="refundVisible"
      :reservation="currentReservation"
      @confirm="handleRefundConfirm"
    />

    <!-- Payment Method Dialog -->
    <el-dialog
      v-model="paymentDialogVisible"
      title="Select Payment Method"
      width="600px"
      align-center
      class="payment-dialog"
    >
      <div class="payment-methods">
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

      <div class="payment-summary" v-if="currentReservation">
        <div class="summary-item">
          <span class="label">Order No:</span>
          <span class="value">{{ currentReservation.orderNo }}</span>
        </div>
        <div class="summary-item">
          <span class="label">Amount:</span>
          <span class="value amount">${{ currentReservation.amount.toFixed(2) }}</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="paymentDialogVisible = false">Cancel</el-button>
          <el-button 
            type="primary" 
            :loading="loading"
            :disabled="!selectedPaymentMethod"
            @click="handlePaymentMethodSelect"
          >
            Confirm Payment
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Create Dialog -->
    <CreateReservationDialog
      v-model="createDialogVisible"
      @created="handleReservationCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Calendar, Timer, Check, Close, RefreshRight, Van, Money, View, ArrowDown, More } from '@element-plus/icons-vue'
import type { Reservation, ReservationSearchForm } from '@/types/reservation'
import { ReservationStatus } from '@/types/reservation'
import RefundDialog from '@/components/reservation/RefundDialog.vue'
import { formatDateTime, formatDuration } from '@/utils/format'
import CreateReservationDialog from '@/components/reservation/CreateReservationDialog.vue'

const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Status map
const statusMap: Record<ReservationStatus, string> = {
  [ReservationStatus.Pending]: 'Pending Payment',
  [ReservationStatus.AwaitingUse]: 'AwaitingUse',
  [ReservationStatus.InUse]: 'In Use',
  [ReservationStatus.Used]: 'Used',
  [ReservationStatus.Cancelled]: 'Cancelled',
  [ReservationStatus.Refunded]: 'Refunded',
  [ReservationStatus.Expired]: 'Expired',
  [ReservationStatus.PaymentFailed]: 'Payment Failed',
  [ReservationStatus.RefundFailed]: 'Refund Failed',
  [ReservationStatus.RefundRequested]: 'Refund Requested',
  [ReservationStatus.RefundInProcess]: 'Processing Refund',
  [ReservationStatus.Overdue]: 'Overdue'
}

// Search form
const searchForm = reactive<ReservationSearchForm>({
  orderNo: '',
  customerName: '',
  parkingLot: '',
  status: '',
  dateRange: null,
  spaceType: ''
})

// Mock parking lots
const parkingLots = [
  { label: 'Downtown Parking', value: 'downtown' },
  { label: 'Airport Parking', value: 'airport' },
  { label: 'Mall Parking', value: 'mall' }
]

// Mock data
const reservationList = ref([
  {
    id: '1',
    orderNo: 'R20240215001',
    customerName: 'John Doe',
    phone: '(123) 456-7890',
    email: 'john@example.com',
    plateNo: 'CA123ABC',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '123',
    spaceType: 'standard',
    startTime: '2024-02-15T10:00:00',
    endTime: '2024-02-15T18:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Pending,
    createdAt: '2024-02-14T15:30:00'
  },
  {
    id: '2',
    orderNo: 'R20240215002',
    customerName: 'Jane Smith',
    phone: '(234) 567-8901',
    email: 'jane@example.com',
    plateNo: 'NY456DEF',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '234',
    spaceType: 'large',
    startTime: '2024-02-15T09:00:00',
    endTime: '2024-02-15T17:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.PaymentFailed,
    createdAt: '2024-02-14T14:30:00'
  },
  {
    id: '3',
    orderNo: 'R20240215003',
    customerName: 'Mike Johnson',
    phone: '(345) 678-9012',
    email: 'mike@example.com',
    plateNo: 'TX789GHI',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '345',
    spaceType: 'standard',
    startTime: '2024-02-15T11:00:00',
    endTime: '2024-02-15T19:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.AwaitingUse,
    createdAt: '2024-02-14T16:30:00'
  },
  {
    id: '4',
    orderNo: 'R20240215004',
    customerName: 'Sarah Wilson',
    phone: '(456) 789-0123',
    email: 'sarah@example.com',
    plateNo: 'FL012JKL',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '456',
    spaceType: 'valet',
    startTime: '2024-02-15T08:00:00',
    endTime: '2024-02-15T16:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.InUse,
    createdAt: '2024-02-14T13:30:00'
  },
  {
    id: '5',
    orderNo: 'R20240215005',
    customerName: 'Tom Brown',
    phone: '(567) 890-1234',
    email: 'tom@example.com',
    plateNo: 'CA345MNO',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '567',
    spaceType: 'standard',
    startTime: '2024-02-15T07:00:00',
    endTime: '2024-02-15T15:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Overdue,
    createdAt: '2024-02-14T12:30:00'
  },
  {
    id: '6',
    orderNo: 'R20240215006',
    customerName: 'Lisa Davis',
    phone: '(678) 901-2345',
    email: 'lisa@example.com',
    plateNo: 'NY678PQR',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '678',
    spaceType: 'large',
    startTime: '2024-02-15T06:00:00',
    endTime: '2024-02-15T14:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.Used,
    createdAt: '2024-02-14T11:30:00'
  },
  {
    id: '7',
    orderNo: 'R20240215007',
    customerName: 'David Miller',
    phone: '(789) 012-3456',
    email: 'david@example.com',
    plateNo: 'TX901STU',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '789',
    spaceType: 'standard',
    startTime: '2024-02-15T05:00:00',
    endTime: '2024-02-15T13:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.RefundRequested,
    createdAt: '2024-02-14T10:30:00'
  },
  {
    id: '8',
    orderNo: 'R20240215008',
    customerName: 'Emma Wilson',
    phone: '(890) 123-4567',
    email: 'emma@example.com',
    plateNo: 'FL234VWX',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '890',
    spaceType: 'valet',
    startTime: '2024-02-15T04:00:00',
    endTime: '2024-02-15T12:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.RefundInProcess,
    createdAt: '2024-02-14T09:30:00'
  },
  {
    id: '9',
    orderNo: 'R20240215009',
    customerName: 'James Taylor',
    phone: '(901) 234-5678',
    email: 'james@example.com',
    plateNo: 'CA567YZA',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '901',
    spaceType: 'standard',
    startTime: '2024-02-15T03:00:00',
    endTime: '2024-02-15T11:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.RefundFailed,
    createdAt: '2024-02-14T08:30:00'
  },
  {
    id: '10',
    orderNo: 'R20240215010',
    customerName: 'Olivia Martin',
    phone: '(012) 345-6789',
    email: 'olivia@example.com',
    plateNo: 'NY890BCD',
    parkingLot: 'Downtown Parking',
    zoneName: 'A',
    spaceNo: '012',
    spaceType: 'large',
    startTime: '2024-02-15T02:00:00',
    endTime: '2024-02-15T10:00:00',
    duration: 480,
    amount: 35.00,
    status: ReservationStatus.Refunded,
    createdAt: '2024-02-14T07:30:00'
  },
  {
    id: '11',
    orderNo: 'R20240215011',
    customerName: 'William Anderson',
    phone: '(123) 456-7890',
    email: 'william@example.com',
    plateNo: 'TX123EFG',
    parkingLot: 'Downtown Parking',
    zoneName: 'B',
    spaceNo: '123',
    spaceType: 'standard',
    startTime: '2024-02-15T01:00:00',
    endTime: '2024-02-15T09:00:00',
    duration: 480,
    amount: 25.00,
    status: ReservationStatus.Cancelled,
    createdAt: '2024-02-14T06:30:00'
  },
  {
    id: '12',
    orderNo: 'R20240215012',
    customerName: 'Sophia Clark',
    phone: '(234) 567-8901',
    email: 'sophia@example.com',
    plateNo: 'FL456HIJ',
    parkingLot: 'Downtown Parking',
    zoneName: 'C',
    spaceNo: '456',
    spaceType: 'valet',
    startTime: '2024-02-15T00:00:00',
    endTime: '2024-02-15T08:00:00',
    duration: 480,
    amount: 45.00,
    status: ReservationStatus.Expired,
    createdAt: '2024-02-14T05:30:00'
  }
])

// Dialog control
const refundVisible = ref(false)

// Status options for filter
const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Pending Payment', value: ReservationStatus.Pending },
  { label: 'AwaitingUse', value: ReservationStatus.AwaitingUse },
  { label: 'In Use', value: ReservationStatus.InUse },
  { label: 'Used', value: ReservationStatus.Used },
  { label: 'Cancelled', value: ReservationStatus.Cancelled },
  { label: 'Refunded', value: ReservationStatus.Refunded },
  { label: 'Expired', value: ReservationStatus.Expired },
  { label: 'Payment Failed', value: ReservationStatus.PaymentFailed },
  { label: 'Refund Failed', value: ReservationStatus.RefundFailed },
  { label: 'Refund Requested', value: ReservationStatus.RefundRequested },
  { label: 'Processing Refund', value: ReservationStatus.RefundInProcess },
  { label: 'Overdue', value: ReservationStatus.Overdue }
]

// Utility functions
const getStatusType = (status: ReservationStatus): string => {
  const types: Record<ReservationStatus, string> = {
    [ReservationStatus.Pending]: 'warning', // 黄色警��
    [ReservationStatus.AwaitingUse]: 'success', // 绿色正常
    [ReservationStatus.InUse]: 'primary', // 蓝色进行中
    [ReservationStatus.Used]: 'success', // 绿色完成
    [ReservationStatus.Cancelled]: 'info', // 灰色取消
    [ReservationStatus.Refunded]: 'info', // 灰色退款
    [ReservationStatus.Expired]: 'danger', // 红色过期
    [ReservationStatus.PaymentFailed]: 'danger', // 红色支付失败
    [ReservationStatus.RefundFailed]: 'danger', // 红色退款失败
    [ReservationStatus.RefundRequested]: 'warning', // 黄色申请退款
    [ReservationStatus.RefundInProcess]: 'warning', // 黄色退款处理中
    [ReservationStatus.Overdue]: 'danger' // 红色超时
  }
  return types[status] || 'info'
}

const getSpaceTypeTag = (type: string): string => {
  const types: Record<string, string> = {
    standard: '',
    large: 'warning',
    valet: 'success'
  }
  return types[type] || ''
}

const formatSpaceType = (type: string): string => {
  const types: Record<string, string> = {
    standard: 'Standard',
    large: 'Large Vehicle',
    valet: 'Valet'
  }
  return types[type] || type
}

const canCancel = (status: ReservationStatus): boolean => {
  return [
    ReservationStatus.Pending,
    ReservationStatus.AwaitingUse
  ].includes(status)
}

const canRefund = (status: ReservationStatus): boolean => {
  return [
    ReservationStatus.AwaitingUse,
    ReservationStatus.Used
  ].includes(status)
}

// Event handlers
const handleSearch = () => {
  // TODO: Implement search logic
  console.log('Search form:', searchForm)
}

const handleReset = () => {
  Object.assign(searchForm, {
    orderNo: '',
    customerName: '',
    parkingLot: '',
    status: '',
    dateRange: null,
    spaceType: ''
  })
}

const handleAdd = () => {
  createDialogVisible.value = true
}

const handleExport = () => {
  // TODO: Implement export logic
  ElMessage.success('Export started')
}

const handleView = (row: Reservation) => {
  router.push(`/reservation/detail/${row.id}`)
}

// 添加支付方式选择弹窗
const paymentDialogVisible = ref(false)
const currentReservation = ref<Reservation | null>(null)
const selectedPaymentMethod = ref('')

// 支付方式选项
const paymentMethods = [
  { label: 'QR Code Payment', value: 'qr_code', icon: 'QrCode' },
  { label: 'Cash', value: 'cash', icon: 'Money' },
  { label: 'Tap to Pay', value: 'tap', icon: 'CreditCard' },
  { label: 'Payment Link (SMS)', value: 'sms', icon: 'Message' },
  { label: 'No Payment Required', value: 'none', icon: 'Check' }
]

// 处理确认支付
const handleConfirmPayment = async (row: Reservation) => {
  currentReservation.value = row
  paymentDialogVisible.value = true
}

// 处理支付方式选择
const handlePaymentMethodSelect = async () => {
  if (!selectedPaymentMethod.value) {
    ElMessage.warning('Please select payment method')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Confirm to process payment via ${getPaymentMethodLabel(selectedPaymentMethod.value)}?`,
      'Confirm Payment',
      { type: 'warning' }
    )

    // TODO: 调用支付处理API
    // 模拟支付处理
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 更新订单状态为待使用
    if (currentReservation.value) {
      currentReservation.value.status = ReservationStatus.AwaitingUse
      // TODO: 更新列表中的订单状态
    }

    ElMessage.success('Payment processed successfully')
    paymentDialogVisible.value = false
    selectedPaymentMethod.value = ''
  } catch {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

// 获取支付方式显示文本
const getPaymentMethodLabel = (value: string): string => {
  return paymentMethods.find(m => m.value === value)?.label || value
}

// 处理取消订单
const handleCancel = async (row: Reservation) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this reservation? This action cannot be undone.',
      'Cancel Reservation',
      {
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No',
        type: 'warning'
      }
    )

    // TODO: 调用取消订单API
    // 模拟取消处理
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新订单状态为已取消
    row.status = ReservationStatus.Cancelled
    // TODO: 更新列表中的订单状态

    ElMessage.success('Reservation cancelled successfully')
  } catch {
    // 用户取消操作
  } finally {
    loading.value = false
  }
}

const handleRefund = (row: Reservation) => {
  currentReservation.value = row
  refundVisible.value = true
}

const handleRefundConfirm = async (data: any) => {
  // TODO: Implement refund logic
  console.log('Refund data:', data)
  ElMessage.success('Refund request submitted')
  refundVisible.value = false
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: Reload data
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: Reload data
}

// 操作按钮判断
const getActions = (status: ReservationStatus): string[] => {
  switch (status) {
    case ReservationStatus.Pending:
      return ['confirm_payment', 'cancel', 'view']
    case ReservationStatus.PaymentFailed:
      return ['retry_payment', 'cancel', 'view']
    case ReservationStatus.AwaitingUse:
      return ['check_in', 'refund', 'view']
    case ReservationStatus.InUse:
      return ['check_out', 'view']
    case ReservationStatus.Overdue:
      return ['check_out', 'add_penalty', 'view']
    case ReservationStatus.Used:
      return ['refund', 'view']
    case ReservationStatus.RefundRequested:
    case ReservationStatus.RefundInProcess:
      return ['view']
    case ReservationStatus.RefundFailed:
      return ['retry_refund', 'view']
    case ReservationStatus.Cancelled:
    case ReservationStatus.Refunded:
    case ReservationStatus.Expired:
      return ['view']
    default:
      return ['view']
  }
}

// Check In 处理
const handleCheckIn = async (row: Reservation) => {
  // 检查是否可以进场
  const now = new Date()
  const startTime = new Date(row.startTime)
  const timeDiff = (startTime.getTime() - now.getTime()) / (1000 * 60) // 转换为分钟

  if (timeDiff > 30) { // 提前30分钟以上
    ElMessageBox.alert(
      `This reservation starts at ${formatDateTime(row.startTime)}. Early check-in is not allowed.`,
      'Early Check-in',
      { type: 'warning' }
    )
    return
  }

  try {
    await ElMessageBox.confirm(
      'Please confirm the parking space is available. Continue with check-in?',
      'Check-in Confirmation',
      {
        confirmButtonText: 'Confirm Check-in',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    // 更新订单状态
    row.status = ReservationStatus.InUse
    row.checkInTime = new Date().toISOString()
    ElMessage.success('Check-in successful')

  } catch {
    // 用户取消操作
    return
  }
}

// Check Out 处理
const handleCheckOut = async (row: Reservation) => {
  const now = new Date()
  const endTime = new Date(row.endTime)
  const overdueMinutes = Math.max(0, (now.getTime() - endTime.getTime()) / (1000 * 60))

  if (overdueMinutes > 0) {
    // 计算超时费用
    const overdueFee = calculatePenaltyAmount(overdueMinutes)
    
    try {
      const action = await ElMessageBox.confirm(
        `Overdue: ${formatDuration(overdueMinutes)}\nPenalty Fee: $${overdueFee.toFixed(2)}\n\nWould you like to collect the penalty fee?`,
        'Overdue Check-out',
        {
          confirmButtonText: 'Collect Fee',
          cancelButtonText: 'Waive Fee',
          type: 'warning',
          distinguishCancelAndClose: true
        }
      )

      if (action === 'confirm') {
        // 显示支付对话框
        showPaymentDialog({
          amount: overdueFee,
          title: 'Overdue Penalty Payment',
          onSuccess: () => {
            completeCheckOut(row, {
              overdueMinutes,
              overdueFee,
              feeCollected: true
            })
          }
        })
      } else {
        // 放弃收费
        completeCheckOut(row, {
          overdueMinutes,
          overdueFee,
          feeCollected: false
        })
      }
    } catch {
      // 用户关闭对话框
      return
    }
  } else {
    // 正常离场
    completeCheckOut(row)
  }
}

// 支付对话框组件
const showPaymentDialog = ({ amount, title, onSuccess }: {
  amount: number
  title: string
  onSuccess: () => void
}) => {
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
    }
  ]

  ElMessageBox.confirm(
    h('div', { class: 'payment-dialog' }, [
      h('div', { class: 'payment-summary' }, [
        h('div', { class: 'summary-item' }, [
          h('span', { class: 'label' }, 'Amount Due:'),
          h('span', { class: 'value amount' }, `$${amount.toFixed(2)}`)
        ])
      ]),
      h('div', { class: 'payment-methods' }, 
        paymentMethods.map(method => 
          h('div', { 
            class: 'payment-method-item',
            onClick: () => {
              // 模支付处理
              ElMessage.success(`Payment successful via ${method.label}`)
              onSuccess()
              // 关闭对话框
              ElMessageBox.close()
            }
          }, [
            h('div', { class: 'method-icon' }, [
              h('el-icon', {}, [h(method.icon)])
            ]),
            h('div', { class: 'method-info' }, [
              h('div', { class: 'method-name' }, method.label),
              h('div', { class: 'method-desc' }, method.description)
            ])
          ])
        )
      )
    ]),
    title,
    {
      showCancelButton: true,
      showConfirmButton: false,
      customClass: 'payment-dialog'
    }
  )
}

// 完成离场
const completeCheckOut = (row: Reservation, overdueInfo?: {
  overdueMinutes: number
  overdueFee: number
  feeCollected: boolean
}) => {
  row.status = ReservationStatus.Used
  row.checkOutTime = new Date().toISOString()
  
  if (overdueInfo) {
    row.overdueMinutes = overdueInfo.overdueMinutes
    if (overdueInfo.feeCollected) {
      row.overdueFee = overdueInfo.overdueFee
      row.amount += overdueInfo.overdueFee
    }
  }

  ElMessage.success('Check-out completed')
}

// 判断是否超时
const isOverdue = (reservation: Reservation): boolean => {
  const endTime = new Date(reservation.endTime)
  return endTime < new Date()
}

// 罚款处理
const handlePenalty = async (row: Reservation) => {
  const overdueDuration = calculateOverdueDuration(row)
  const penaltyAmount = calculatePenaltyAmount(overdueDuration)
  
  try {
    await ElMessageBox.confirm(
      `Overdue ${formatDuration(overdueDuration)}, penalty amount: $${penaltyAmount.toFixed(2)}`,
      'Add Penalty',
      { type: 'warning' }
    )
    // TODO: 调用罚款API
    ElMessage.success('Penalty added successfully')
  } catch {
    // User cancelled
  }
}

// 计算超时时长(分钟)
const calculateOverdueDuration = (reservation: Reservation): number => {
  const endTime = new Date(reservation.endTime)
  const now = new Date()
  return Math.floor((now.getTime() - endTime.getTime()) / (1000 * 60))
}

// 计算罚款金额
const calculatePenaltyAmount = (overdueDuration: number): number => {
  // 示: 每小时10美元
  const hourlyRate = 10
  const hours = Math.ceil(overdueDuration / 60)
  return hours * hourlyRate
}

// 添加控制变量
const createDialogVisible = ref(false)

// 添加创建成功的处理函数
const handleReservationCreated = () => {
  // 重新加载列表数据
  loadReservationList()
}
</script>

<style scoped lang="scss">
.reservation-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .time-info {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .el-icon {
      margin-right: 4px;
      color: #909399;
    }
  }

  .amount {
    font-weight: bold;
    color: #67c23a;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .primary-action {
      flex: 1;
      min-width: 0; // 防止按钮溢出
      
      .el-button {
        width: 100%;
        justify-content: center;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }

    .secondary-action {
      flex-shrink: 0;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.payment-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .payment-method-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
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
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background-color: var(--el-color-primary-light-8);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .el-icon {
        font-size: 24px;
        color: var(--el-color-primary);
      }
    }

    .method-info {
      flex: 1;
      min-width: 0;

      .method-name {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 4px;
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
      top: 12px;
      right: 12px;
      color: var(--el-color-primary);
      font-size: 18px;
    }
  }
}

.payment-summary {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 20px;

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .label {
      color: var(--el-text-color-secondary);
    }

    .value {
      font-weight: 500;
      color: var(--el-text-color-primary);

      &.amount {
        font-size: 18px;
        color: var(--el-color-success);
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.action-buttons {
  display: flex;
  gap: 16px;
  
  &.single-action {
    justify-content: center;
  }
  
  .el-button {
    padding: 4px 0;
    height: auto;
    font-size: 14px;
  }
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .el-icon {
    margin-right: 4px;
    color: #909399;
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-width: 160px;
  
  .el-icon {
    margin-right: 4px;
  }
}

.space-location {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-tag {
    margin: 0;
  }
}
</style>