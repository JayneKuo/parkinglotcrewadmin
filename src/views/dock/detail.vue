<template>
  <div class="detail-container">
    <!-- Header with Back and Actions -->
    <el-card class="header-card">
      <div class="detail-header">
        <div class="left">
          <el-button @click="$router.push('/dock')">
            <el-icon><ArrowLeft /></el-icon>Back
          </el-button>
          <span class="order-no">Order: {{ orderInfo.orderNumber }}</span>
          <el-tag :type="getStatusType(orderInfo.status)" size="large">
            {{ orderInfo.status }}
          </el-tag>
        </div>
        <div class="right">
          <template v-for="action in getActions(orderInfo.status)" :key="action.action">
            <el-button
              :type="getButtonType(action.action)"
              @click="handleAction(action.action)"
            >
              <el-icon><component :is="action.icon" /></el-icon>
              {{ action.label }}
            </el-button>
          </template>
        </div>
      </div>
    </el-card>

    <!-- Main Content -->
    <div class="content-wrapper">
      <div class="left-content">
        <!-- Order Information -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Order Information</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Order Number">{{ orderInfo.orderNumber }}</el-descriptions-item>
            <el-descriptions-item label="Creation Time">{{ orderInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="Status">
              <el-tag :type="getStatusType(orderInfo.status)">{{ orderInfo.status }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Driver Information -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Driver Information</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Name">{{ driverInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="Phone">{{ driverInfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="License Plate">{{ driverInfo.licensePlate }}</el-descriptions-item>
            <el-descriptions-item label="Carrier">{{ driverInfo.carrier }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Reservation Information -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Reservation Information</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Parking Lot">{{ reservationInfo.parkingLot }}</el-descriptions-item>
            <el-descriptions-item label="Address">{{ reservationInfo.address }}</el-descriptions-item>
            <el-descriptions-item label="Load Type">{{ reservationInfo.loadType }}</el-descriptions-item>
            <el-descriptions-item label="Billing Type">{{ reservationInfo.billingType }}</el-descriptions-item>
            <el-descriptions-item label="Parking Spaces">{{ reservationInfo.parkingSpaces }}</el-descriptions-item>
            <el-descriptions-item label="Start Time">{{ reservationInfo.startTime }}</el-descriptions-item>
            <el-descriptions-item label="Estimated Duration">{{ reservationInfo.estimatedDuration }}</el-descriptions-item>
            <el-descriptions-item label="Dock Number">
              {{ reservationInfo.dockNumber || 'Will be assigned after check-in' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- Parking Information -->
        <el-card v-if="hasParkingInfo" class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Parking Information</span>
            </div>
          </template>
          <div class="fee-list">
            <div class="fee-item">
              <span class="fee-label">Check-in Time</span>
              <span class="fee-value">{{ parkingInfo.checkInTime || '-' }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Loading Complete Time</span>
              <span class="fee-value">{{ parkingInfo.loadingCompleteTime || '-' }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Check-out Time</span>
              <span class="fee-value">{{ parkingInfo.checkOutTime || '-' }}</span>
            </div>
            <div class="fee-item total">
              <span class="fee-label">Parking Duration</span>
              <span class="fee-value">{{ parkingDuration }}</span>
            </div>
          </div>
        </el-card>

        <!-- Cargo Information -->
        <el-card class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Cargo Information</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Cargo Type">{{ cargoInfo.type || 'Not provided' }}</el-descriptions-item>
            <el-descriptions-item label="PO Number">{{ cargoInfo.poNumber || 'Not provided' }}</el-descriptions-item>
            <el-descriptions-item label="Weight">{{ cargoInfo.weight || 'Not provided' }}</el-descriptions-item>
            <el-descriptions-item label="Quantity">{{ cargoInfo.quantity || 'Not provided' }}</el-descriptions-item>
            <el-descriptions-item label="Description">{{ cargoInfo.description || 'Not provided' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </div>

      <!-- Right Content -->
      <div class="right-content">
        <!-- Order Summary -->
        <el-card v-if="!isLoadingComplete" class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Order Summary</span>
            </div>
          </template>
          <div class="fee-list">
            <div class="fee-item">
              <span class="fee-label">Parking Fee</span>
              <span class="fee-value">${{ summary.parkingFee }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Service Fee</span>
              <span class="fee-value">${{ summary.serviceFee }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Tax</span>
              <span class="fee-value">${{ summary.tax }}</span>
            </div>
            <div class="fee-item subtotal">
              <span class="fee-label">Subtotal</span>
              <span class="fee-value">${{ summary.subtotal }}</span>
            </div>
            <div class="fee-item total">
              <span class="fee-label">Final Amount</span>
              <span class="fee-value success">${{ summary.total }}</span>
            </div>
          </div>
        </el-card>

        <!-- Payment Information -->
        <el-card v-if="hasPaymentInfo" class="detail-section">
          <template #header>
            <div class="card-header">
              <span>Payment Information</span>
              <el-tag :type="paymentStatusType" size="small">
                {{ paymentInfo.status }}
              </el-tag>
            </div>
          </template>
          <div class="fee-list">
            <div class="fee-item">
              <span class="fee-label">Payment Method</span>
              <span class="fee-value">{{ paymentInfo.method }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Transaction ID</span>
              <span class="fee-value">{{ paymentInfo.transactionId }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">Payment Time</span>
              <span class="fee-value">{{ paymentInfo.paymentTime }}</span>
            </div>
            <div class="fee-item total">
              <span class="fee-label">Paid Amount</span>
              <span class="fee-value success">${{ paymentInfo.amount }}</span>
            </div>
          </div>
        </el-card>

        <!-- Timeline -->
        <el-card class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>Status Timeline</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in formattedTimeline"
              :key="index"
              :type="activity.type"
              :color="activity.color"
              :icon="activity.icon"
              :timestamp="activity.timestamp"
              size="large"
            >
              <h4 class="timeline-title">{{ activity.content }}</h4>
              <p v-if="activity.detail" class="timeline-detail">{{ activity.detail }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowLeft, Check, Close, Edit, Location, Timer, Document, Message, Van, Finished } from '@element-plus/icons-vue'

// Status configurations
const STATUS_CONFIG = {
  PENDING: { label: 'Pending', type: 'info' },
  CONFIRMED: { label: 'Confirmed', type: 'primary' },
  IN_PROGRESS: { label: 'In Progress', type: 'warning' },
  COMPLETED: { label: 'Completed', type: 'success' },
  CANCELLED: { label: 'Cancelled', type: 'danger' }
}

// Action configurations
const STATUS_ACTIONS = {
  PENDING: [
    { action: 'approve', label: 'Approve', icon: 'Check', type: 'success' },
    { action: 'reject', label: 'Reject', icon: 'Close', type: 'danger' },
    { action: 'modify', label: 'Modify', icon: 'Edit', type: 'warning' }
  ],
  CONFIRMED: [
    { action: 'assign-dock', label: 'Assign Dock', icon: 'Location', type: 'primary' },
    { action: 'cancel', label: 'Cancel', icon: 'Close', type: 'danger' }
  ],
  IN_PROGRESS: [
    { action: 'monitor-progress', label: 'Monitor Progress', icon: 'Timer', type: 'warning' },
    { action: 'complete-loading', label: 'Complete Loading', icon: 'Finished', type: 'success' }
  ],
  COMPLETED: [
    { action: 'view-bill', label: 'View Bill', icon: 'Document', type: 'info' },
    { action: 'send-reminder', label: 'Send Reminder', icon: 'Message', type: 'warning' }
  ]
}

// Status Timeline Configuration
const STATUS_TIMELINE_CONFIG = {
  CREATED: {
    type: 'primary',
    color: '#409EFF',
    icon: 'Document',
    label: 'Order Created'
  },
  CONFIRMED: {
    type: 'success',
    color: '#67C23A',
    icon: 'Check',
    label: 'Order Confirmed'
  },
  ARRIVED: {
    type: 'warning',
    color: '#E6A23C',
    icon: 'Van',
    label: 'Vehicle Arrived'
  },
  DOCK_ASSIGNED: {
    type: 'primary',
    color: '#409EFF',
    icon: 'Location',
    label: 'Dock Assigned'
  },
  CHECKED_IN: {
    type: 'warning',
    color: '#E6A23C',
    icon: 'Timer',
    label: 'Checked In'
  },
  LOADING_STARTED: {
    type: 'warning',
    color: '#E6A23C',
    icon: 'Loading',
    label: 'Loading Started'
  },
  LOADING_COMPLETED: {
    type: 'success',
    color: '#67C23A',
    icon: 'Finished',
    label: 'Loading Completed'
  },
  CHECKED_OUT: {
    type: 'success',
    color: '#67C23A',
    icon: 'Right',
    label: 'Checked Out'
  },
  PAYMENT_PENDING: {
    type: 'warning',
    color: '#E6A23C',
    icon: 'Wallet',
    label: 'Payment Pending'
  },
  PAID: {
    type: 'success',
    color: '#67C23A',
    icon: 'Money',
    label: 'Payment Completed'
  },
  COMPLETED: {
    type: 'success',
    color: '#67C23A',
    icon: 'CircleCheck',
    label: 'Order Completed'
  },
  CANCELLED: {
    type: 'danger',
    color: '#F56C6C',
    icon: 'CircleClose',
    label: 'Order Cancelled'
  }
}

// Mock data
const mockOrderDetail = {
  orderInfo: {
    orderNumber: 'DO2024031001',
    createTime: '2024-03-10 09:00:00',
    status: 'IN_PROGRESS'
  },
  driverInfo: {
    name: 'John Smith',
    phone: '13800138000',
    licensePlate: 'B12345',
    carrier: 'ABC Logistics'
  },
  reservationInfo: {
    parkingLot: 'Main Warehouse Parking',
    address: '123 Logistics Ave, Shenzhen',
    loadType: 'Container',
    billingType: 'Hourly',
    parkingSpaces: 2,
    startTime: '2024-03-10 10:00:00',
    estimatedDuration: '2 hours',
    dockNumber: 'D001'
  },
  parkingInfo: {
    checkInTime: '2024-03-10 09:55:00',
    loadingCompleteTime: '2024-03-10 11:30:00',
    checkOutTime: '2024-03-10 11:45:00'
  },
  cargoInfo: {
    type: 'Electronics',
    poNumber: 'PO2024031001',
    weight: '2000 kg',
    quantity: '100 boxes',
    description: 'Consumer electronics'
  },
  summary: {
    parkingFee: '20.00',
    serviceFee: '2.50',
    tax: '2.50',
    subtotal: '25.00',
    total: '25.00'
  },
  paymentInfo: {
    amount: '25.00',
    method: 'Credit Card',
    transactionId: 'TXN20240310001',
    paymentTime: '2024-03-10 11:30:00',
    status: 'PAID'  // PAID, UNPAID, PENDING
  },
  statusHistory: [
    {
      status: 'CREATED',
      timestamp: '2024-03-10 09:00:00',
      detail: 'Order #DO2024031001 created'
    },
    {
      status: 'CONFIRMED',
      timestamp: '2024-03-10 09:30:00',
      detail: 'Order confirmed by operator'
    },
    {
      status: 'ARRIVED',
      timestamp: '2024-03-10 09:45:00',
      detail: 'Vehicle arrived at parking lot'
    },
    {
      status: 'DOCK_ASSIGNED',
      timestamp: '2024-03-10 09:50:00',
      detail: 'Assigned to Dock D001'
    },
    {
      status: 'CHECKED_IN',
      timestamp: '2024-03-10 09:55:00',
      detail: 'Vehicle checked in at parking spot P001'
    },
    {
      status: 'LOADING_STARTED',
      timestamp: '2024-03-10 10:00:00',
      detail: 'Loading operation started'
    },
    {
      status: 'LOADING_COMPLETED',
      timestamp: '2024-03-10 11:30:00',
      detail: 'Loading operation completed'
    },
    {
      status: 'PAYMENT_PENDING',
      timestamp: '2024-03-10 11:35:00',
      detail: 'Payment amount: $25.00'
    },
    {
      status: 'PAID',
      timestamp: '2024-03-10 11:40:00',
      detail: 'Paid via Credit Card'
    },
    {
      status: 'CHECKED_OUT',
      timestamp: '2024-03-10 11:45:00',
      detail: 'Vehicle left parking lot'
    },
    {
      status: 'COMPLETED',
      timestamp: '2024-03-10 11:50:00',
      detail: 'Order successfully completed'
    }
  ]
}

export default {
  name: 'DockOrderDetail',
  components: {
    ArrowLeft,
    Check,
    Close,
    Edit,
    Location,
    Timer,
    Document,
    Message,
    Van,
    Finished
  },
  data() {
    return {
      orderInfo: {},
      driverInfo: {},
      reservationInfo: {},
      parkingInfo: {},
      cargoInfo: {},
      summary: {},
      paymentInfo: {},
      statusTimeline: []
    }
  },
  computed: {
    hasParkingInfo() {
      return this.parkingInfo.checkInTime || 
             this.parkingInfo.loadingCompleteTime || 
             this.parkingInfo.checkOutTime
    },
    isLoadingComplete() {
      return this.parkingInfo.loadingCompleteTime !== ''
    },
    hasPaymentInfo() {
      return this.orderInfo.status === 'COMPLETED' || this.paymentInfo.status === 'PAID'
    },
    paymentStatusType() {
      const statusMap = {
        PAID: 'success',
        UNPAID: 'danger',
        PENDING: 'warning'
      }
      return statusMap[this.paymentInfo.status] || 'info'
    },
    parkingDuration() {
      if (!this.parkingInfo.checkInTime) return '-'
      
      const endTime = this.parkingInfo.checkOutTime || 
                     this.parkingInfo.loadingCompleteTime || 
                     new Date()
      
      const duration = new Date(endTime) - new Date(this.parkingInfo.checkInTime)
      const hours = Math.floor(duration / (1000 * 60 * 60))
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
      
      return `${hours}h ${minutes}m`
    },
    formattedTimeline() {
      return this.statusTimeline.map(item => {
        const config = STATUS_TIMELINE_CONFIG[item.status]
        return {
          ...item,
          type: config.type,
          color: config.color,
          content: config.label,
          icon: config.icon
        }
      })
    }
  },
  created() {
    this.getOrderDetails()
  },
  methods: {
    getStatusType(status) {
      return STATUS_CONFIG[status]?.type || 'info'
    },
    getActions(status) {
      return STATUS_ACTIONS[status] || []
    },
    getButtonType(action) {
      const actionConfig = Object.values(STATUS_ACTIONS)
        .flat()
        .find(a => a.action === action)
      return actionConfig?.type || 'primary'
    },
    async handleAction(action) {
      try {
        switch (action) {
          case 'approve':
            await this.handleApprove()
            break
          case 'reject':
            await this.handleReject()
            break
          case 'modify':
            await this.handleModify()
            break
          case 'assign-dock':
            await this.handleAssignDock()
            break
          case 'cancel':
            await this.handleCancel()
            break
          case 'monitor-progress':
            await this.handleMonitorProgress()
            break
          case 'complete-loading':
            await this.handleCompleteLoading()
            break
          case 'view-bill':
            await this.handleViewBill()
            break
          case 'send-reminder':
            await this.handleSendReminder()
            break
          default:
            console.warn('Unhandled action:', action)
        }
      } catch (error) {
        this.$message.error('Operation failed')
        console.error(error)
      }
    },
    async getOrderDetails() {
      try {
        // In real project, call actual API
        // const response = await this.$api.getDockOrderDetail(this.$route.params.id)
        
        // Using mock data
        const mockResponse = { data: mockOrderDetail }
        
        if (mockResponse.data) {
          const { 
            orderInfo, 
            driverInfo, 
            reservationInfo, 
            parkingInfo, 
            cargoInfo, 
            paymentInfo, 
            statusHistory 
          } = mockResponse.data
          
          Object.assign(this, {
            orderInfo,
            driverInfo,
            reservationInfo,
            parkingInfo,
            cargoInfo,
            paymentInfo,
            statusTimeline: statusHistory
          })
          
          if (!this.isLoadingComplete) {
            this.calculateOrderSummary()
          }
        }
      } catch (error) {
        this.$message.error('Failed to get order details')
        console.error(error)
      }
    },
    calculateOrderSummary() {
      this.summary = mockOrderDetail.summary
    },
    // Action handlers
    async handleApprove() {
      // TODO: Implement approve logic
    },
    async handleReject() {
      // TODO: Implement reject logic
    },
    async handleModify() {
      // TODO: Implement modify logic
    },
    async handleAssignDock() {
      // TODO: Implement assign dock logic
    },
    async handleCancel() {
      // TODO: Implement cancel logic
    },
    async handleMonitorProgress() {
      // TODO: Implement monitor progress logic
    },
    async handleCompleteLoading() {
      // TODO: Implement complete loading logic
    },
    async handleViewBill() {
      // TODO: Implement view bill logic
    },
    async handleSendReminder() {
      // TODO: Implement send reminder logic
    }
  }
}
</script>

<style scoped>
.detail-container {
  padding: 20px;
  min-height: 100vh;
  background-color: var(--el-fill-color-light);
}

.header-card {
  margin-bottom: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-header .left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-header .right {
  display: flex;
  gap: 12px;
}

.order-no {
  font-size: 20px;
  font-weight: bold;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.left-content {
  flex: 1;
  min-width: 0;
}

.right-content {
  width: 360px;
}

.detail-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-card {
  position: sticky;
  top: 20px;
}

.timeline-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-descriptions__label) {
  width: 140px;
  font-weight: normal;
}

:deep(.el-descriptions__content) {
  font-weight: bold;
}

.total-amount {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-success);
}

.amount {
  font-weight: bold;
  color: var(--el-color-success);
}

.payment-card {
  background-color: var(--el-color-white);
}

.payment-content {
  padding: 16px 0;
}

.payment-amount {
  text-align: center;
  padding: 16px 0;
}

.amount-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.amount-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-success);
}

.el-divider {
  margin: 16px 0;
}

:deep(.el-descriptions__label) {
  width: 140px;
  font-weight: normal;
  color: var(--el-text-color-regular);
}

:deep(.el-descriptions__content) {
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.right-content {
  width: 360px;
}

.detail-section {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-blank);
}

:deep(.el-descriptions) {
  padding: 0 16px;
}

.fee-list {
  padding: 12px 20px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-label {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.fee-value {
  font-weight: 500;
  font-size: 14px;
}

.fee-value.success {
  color: var(--el-color-success);
  font-size: 16px;
  font-weight: bold;
}

.subtotal {
  background-color: var(--el-fill-color-light);
}

.total {
  background-color: var(--el-fill-color-light);
  margin-top: 1px;
}

.total .fee-label {
  font-weight: bold;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-fill-color-blank);
}

.right-content {
  width: 360px;
}

.detail-section {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.timeline-title {
  font-size: 14px;
  margin: 0;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}

.timeline-detail {
  font-size: 13px;
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-white);
  border: 2px solid currentColor;
}

:deep(.el-timeline-item__tail) {
  border-left: 2px solid var(--el-timeline-node-color);
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}

:deep(.el-timeline-item__timestamp) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  margin-bottom: 4px;
}
</style> 