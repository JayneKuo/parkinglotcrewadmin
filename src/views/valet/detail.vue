<template>
  <div class="valet-detail">
    <!-- Header -->
    <div class="detail-header">
      <div class="left">
        <el-button @click="router.push('/valet')">
          <el-icon><ArrowLeft /></el-icon>Back
        </el-button>
        <span class="order-no">Order: {{ order?.orderNo }}</span>
      </div>
      <div class="right">
        <!-- Action Buttons -->
        <template v-if="order">
          <!-- Reserved -->
          <template v-if="order.status === ValetStatus.Reserved">
            <el-button type="primary" @click="handleCheckIn(order)">
              <el-icon><Van /></el-icon>Check In
            </el-button>
            <el-button type="danger" @click="handleCancel(order)">
              <el-icon><Close /></el-icon>Cancel
            </el-button>
          </template>

          <!-- CheckedIn -->
          <template v-if="order.status === ValetStatus.CheckedIn">
            <el-button type="primary" @click="handleMarkPending(order)">
              <el-icon><Van /></el-icon>Mark as Pending
            </el-button>
          </template>

          <!-- Pending -->
          <template v-if="order.status === ValetStatus.Pending">
            <el-button type="primary" @click="handleVehicleInfo(order)">
              <el-icon><Camera /></el-icon>Update Vehicle Info
            </el-button>
            <el-button type="primary" @click="handleAssignDriver(order)">
              <el-icon><User /></el-icon>Reassign Driver
            </el-button>
            <el-button type="primary" @click="handleParked(order)">
              <el-icon><Location /></el-icon>Mark as Parked
            </el-button>
          </template>

          <!-- Parked -->
          <template v-if="order.status === ValetStatus.Parked">
            <el-button type="warning" @click="handleRequestPickup(order)">
              <el-icon><Timer /></el-icon>Request Pickup
            </el-button>
          </template>

          <!-- Requested -->
          <template v-if="order.status === ValetStatus.Requested">
            <el-button type="primary" @click="handleStartPickup(order)">
              <el-icon><Van /></el-icon>Start Pickup
            </el-button>
          </template>

          <!-- OnTheWay -->
          <template v-if="order.status === ValetStatus.OnTheWay">
            <el-button type="success" @click="handleReady(order)">
              <el-icon><Check /></el-icon>Mark as Ready
            </el-button>
          </template>

          <!-- Ready -->
          <template v-if="order.status === ValetStatus.Ready">
            <el-button type="primary" @click="handlePayment(order)">
              <el-icon><Money /></el-icon>Process Payment
            </el-button>
          </template>

          <!-- Paid -->
          <template v-if="order.status === ValetStatus.Paid">
            <el-button type="success" @click="handleComplete(order)">
              <el-icon><Check /></el-icon>Complete
            </el-button>
          </template>
        </template>
      </div>
    </div>

    <!-- Content -->
    <template v-if="order">
      <div class="detail-content">
        <!-- Left Content -->
        <div class="left-content">
          <!-- 订单基本信息 -->
          <div class="detail-section">
            <h3>
              Order Information
              <div class="status-tags">
                <el-tag :type="getSourceType(order.source)" class="source-tag">
                  {{ formatSource(order.source) }}
                </el-tag>
              </div>
            </h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Order No.">{{ order.orderNo }}</el-descriptions-item>
              <el-descriptions-item label="Status">
                <div class="status-tags">
                  <el-tag :type="getStatusType(order.status)">
                    {{ formatStatus(order.status) }}
                  </el-tag>
                  <el-tag 
                    v-if="order.paymentStatus === 'unpaid'" 
                    type="danger" 
                    class="ml-2"
                  >
                    Unpaid
                  </el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="Created At">{{ formatDateTime(order.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="Parking Lot">{{ order.parkingLot }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 客户预定信息 -->
          <div class="detail-section">
            <h3>Customer Information</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Customer">{{ order.customerName }}</el-descriptions-item>
              <el-descriptions-item label="Phone">{{ order.phone }}</el-descriptions-item>
              <el-descriptions-item label="Car Model">{{ order.carModel }}</el-descriptions-item>
              <el-descriptions-item label="Car Color">{{ order.carColor }}</el-descriptions-item>
              <el-descriptions-item label="Plate No.">
                <el-tag>{{ order.plateNo }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Reserved Time">
                {{ formatDateTime(order.createdAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 泊车服务信息 -->
          <div class="detail-section">
            <h3>Valet Service Information</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Rate Type">
                <el-tag type="success">{{ formatRateType(order.rateType || '') }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Rate">
                ${{ order.rate }}/{{ formatRateUnit(order.rateType || '') }}
              </el-descriptions-item>
              <el-descriptions-item label="Space Location">
                <template v-if="order.zoneName || order.spaceNo">
                  <el-tag type="info">Zone {{ order.zoneName }}</el-tag>
                  <el-tag type="success" class="ml-2">Space {{ order.spaceNo }}</el-tag>
                </template>
                <template v-else>
                  <span class="text-gray">Not Assigned</span>
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="Check-in Time" v-if="order.checkedInAt">
                {{ formatDateTime(order.checkedInAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="Parked Time" v-if="order.parkedAt">
                {{ formatDateTime(order.parkedAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 泊车员信息 -->
          <div class="detail-section" v-if="order.driverId">
            <h3>Driver Information</h3>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Driver Name">
                {{ getDriverName(order.driverId) }}
              </el-descriptions-item>
              <el-descriptions-item label="Driver Phone">
                {{ getDriverPhone(order.driverId) }}
              </el-descriptions-item>
              <el-descriptions-item label="Assigned Time">
                {{ formatDateTime(order.driverAssignedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getDriverStatusType(order.driverStatus)">
                  {{ formatDriverStatus(order.driverStatus) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 车辆检查照片 -->
          <div class="detail-section" v-if="hasVehiclePhotos">
            <h3>Vehicle Inspection Photos</h3>
            <div class="photo-grid">
              <div class="photo-item" v-for="(photo, type) in order.photos" :key="type">
                <h4>{{ formatPhotoType(type) }}</h4>
                <el-image 
                  :src="photo" 
                  fit="cover"
                  :preview-src-list="[photo]"
                >
                  <template #error>
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                      <span>No Photo</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Content -->
        <div class="right-content">
          <div class="sticky-container">
            <!-- 支付信息 -->
            <div class="payment-card">
              <h3>Payment Information</h3>
              <el-descriptions direction="vertical" :column="1" border>
                <el-descriptions-item label="Parking Fee">
                  <span class="amount">${{ order.parkingFee?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Service Fee">
                  <span class="amount">${{ order.serviceFee?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Tax">
                  <span class="amount">${{ order.tax?.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="Subtotal">
                  <span class="subtotal">${{ calculateSubtotal().toFixed(2) }}</span>
                </el-descriptions-item>
                <div class="divider">Final Amount</div>
                <div class="total-amount">${{ order.amount.toFixed(2) }}</div>

                <!-- 支付完成后显示支付信息 -->
                <template v-if="order.status === ValetStatus.Paid">
                  <el-descriptions-item label="Payment Method">
                    {{ order.paymentMethod }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Transaction ID">
                    {{ order.transactionId }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Payment Time">
                    {{ formatDateTime(order.paidAt) }}
                  </el-descriptions-item>
                </template>
              </el-descriptions>
            </div>

            <!-- 状态时间轴 -->
            <div class="timeline-card">
              <h3>Status Timeline</h3>
              <el-timeline>
                <!-- 创建订单 -->
                <el-timeline-item
                  type="primary"
                  :timestamp="formatDateTime(order.createdAt)"
                >
                  Order Created
                  <div class="timeline-detail">
                    Source: {{ formatSource(order.source) }}
                  </div>
                </el-timeline-item>

                <!-- 客户到店 -->
                <el-timeline-item
                  v-if="order.checkedInAt"
                  type="success"
                  :timestamp="formatDateTime(order.checkedInAt)"
                >
                  Customer Check-in
                </el-timeline-item>

                <!-- 分配司机 -->
                <el-timeline-item
                  v-if="order.driverAssignedAt"
                  type="warning"
                  :timestamp="formatDateTime(order.driverAssignedAt)"
                >
                  Driver Assigned
                  <div class="timeline-detail">
                    Driver: {{ getDriverName(order.driverId) }}
                  </div>
                </el-timeline-item>

                <!-- 完成泊车 -->
                <el-timeline-item
                  v-if="order.parkedAt"
                  type="success"
                  :timestamp="formatDateTime(order.parkedAt)"
                >
                  Vehicle Parked
                  <div class="timeline-detail">
                    Location: Zone {{ order.zoneName }} - Space {{ order.spaceNo }}
                  </div>
                </el-timeline-item>

                <!-- 请求取车 -->
                <el-timeline-item
                  v-if="order.requestedAt"
                  type="warning"
                  :timestamp="formatDateTime(order.requestedAt)"
                >
                  Pickup Requested
                </el-timeline-item>

                <!-- 车辆就绪 -->
                <el-timeline-item
                  v-if="order.readyAt"
                  type="success"
                  :timestamp="formatDateTime(order.readyAt)"
                >
                  Vehicle Ready
                </el-timeline-item>

                <!-- 支付完成 -->
                <el-timeline-item
                  v-if="order.paidAt"
                  type="success"
                  :timestamp="formatDateTime(order.paidAt)"
                >
                  Payment Completed
                  <div class="timeline-detail">
                    Method: {{ order.paymentMethod }}
                  </div>
                </el-timeline-item>

                <!-- 订单完成 -->
                <el-timeline-item
                  v-if="order.closedAt"
                  type="success"
                  :timestamp="formatDateTime(order.closedAt)"
                >
                  Order Completed
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 添加 ParkingSpaceDialog 组件 -->
    <ParkingSpaceDialog
      v-model="parkingSpaceVisible"
      :order="currentOrder"
      @confirm="handleParkingSpaceConfirm"
    />

    <!-- 添加 AssignDriverDialog 组件 -->
    <AssignDriverDialog
      v-model="assignDriverVisible"
      :order="currentOrder"
      :available-drivers="availableDrivers"
      @confirm="handleAssignConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Van, Close, User, Location, Timer, 
  Money, Check, Picture, Camera, Plus, Warning, InfoFilled 
} from '@element-plus/icons-vue'
import type { ValetOrder, ValetDriver } from '@/types/valet'
import { ValetStatus, ValetSource, mockValetOrders } from '@/types/valet'
import { formatDateTime, formatDuration } from '@/utils/format'
import AssignDriverDialog from '@/components/valet/AssignDriverDialog.vue'
import ParkingSpaceDialog from '@/components/valet/ParkingSpaceDialog.vue'

const route = useRoute()
const router = useRouter()
const order = ref<ValetOrder | null>(null)
const loading = ref(false)

// Dialog control
const assignDriverVisible = ref(false)
const paymentVisible = ref(false)
const parkingSpaceVisible = ref(false)
const currentOrder = ref<ValetOrder | null>(null)
const paymentOption = ref('pay_now')

// Mock available drivers
const availableDrivers = ref<ValetDriver[]>([
  {
    id: 'D001',
    name: 'Tom Wilson',
    phone: '(111) 222-3333',
    status: 'available',
    rating: 4.8,
    totalOrders: 156
  },
  {
    id: 'D002',
    name: 'Jack Brown',
    phone: '(222) 333-4444',
    status: 'available',
    rating: 4.9,
    totalOrders: 203
  },
  {
    id: 'D003',
    name: 'David Lee',
    phone: '(333) 444-5555',
    status: 'available',
    rating: 4.7,
    totalOrders: 178
  },
  {
    id: 'D004',
    name: 'Michael Chen',
    phone: '(444) 555-6666',
    status: 'available',
    rating: 4.6,
    totalOrders: 145
  },
  {
    id: 'D005',
    name: 'William Taylor',
    phone: '(555) 666-7777',
    status: 'busy',
    rating: 4.9,
    totalOrders: 234
  }
])

// 处理取消
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order',
      { type: 'warning' }
    )
    // TODO: 实现取消逻辑
    ElMessage.success('Order cancelled')
  } catch {
    // User cancelled
  }
}

// 处理分配泊车员
const handleAssignDriver = (order: ValetOrder) => {
  currentOrder.value = order
  assignDriverVisible.value = true
}

// 处理开始取车
const handleStartPickup = (order: ValetOrder) => {
  order.status = ValetStatus.OnTheWay
  ElMessage.success('Started pickup process')
}

// 处理车辆就绪
const handleReady = (order: ValetOrder) => {
  order.status = ValetStatus.Ready
  order.readyAt = new Date().toISOString()
  ElMessage.success('Vehicle ready for pickup')
}

// 处理支付
const handlePayment = (order: ValetOrder) => {
  currentOrder.value = order
  paymentVisible.value = true
}

// 处理完成订单
const handleComplete = (order: ValetOrder) => {
  order.status = ValetStatus.Closed
  order.closedAt = new Date().toISOString()
  ElMessage.success('Order completed')
}

// 格式服务类型
const formatServiceType = (type: string): string => {
  const types: Record<string, string> = {
    standard: 'Standard Service',
    premium: 'Premium Service',
    vip: 'VIP Service'
  }
  return types[type] || type
}

// 格式费率类型
const formatRateType = (type: string): string => {
  const types: Record<string, string> = {
    hourly: 'Hourly Rate',
    daily: 'Daily Rate',
    fixed: 'Fixed Rate'
  }
  return types[type] || type
}

// 格式化费率单位
const formatRateUnit = (type: string): string => {
  const types: Record<string, string> = {
    hourly: 'hour',
    daily: 'day',
    fixed: 'service'
  }
  return types[type] || type
}

// 获取司机姓名
const getDriverName = (driverId: string): string => {
  // TODO: 替换为实际的司机数据
  const driverMap: Record<string, string> = {
    'D001': 'John Smith',
    'D002': 'Mike Johnson',
    'D003': 'David Wilson'
  }
  return driverMap[driverId] || driverId
}

// 获取司机电话
const getDriverPhone = (driverId: string): string => {
  // TODO: 替换为实际的司机数据
  const driverPhones: Record<string, string> = {
    'D001': '(123) 456-7890',
    'D002': '(234) 567-8901',
    'D003': '(345) 678-9012'
  }
  return driverPhones[driverId] || '-'
}

// 获取状态标签类型
const getStatusType = (status: ValetStatus): string => {
  const types: Record<ValetStatus, string> = {
    [ValetStatus.Reserved]: 'warning',
    [ValetStatus.CheckedIn]: 'info',
    [ValetStatus.Pending]: 'warning',
    [ValetStatus.Parked]: 'success',
    [ValetStatus.Requested]: 'warning',
    [ValetStatus.OnTheWay]: 'warning',
    [ValetStatus.Ready]: 'success',
    [ValetStatus.Paid]: 'success',
    [ValetStatus.Closed]: 'info'
  }
  return types[status] || 'info'
}

// 格式化状态显示
const formatStatus = (status: ValetStatus): string => {
  const statusMap: Record<ValetStatus, string> = {
    [ValetStatus.Reserved]: 'Reserved',
    [ValetStatus.CheckedIn]: 'Checked In',
    [ValetStatus.Pending]: 'Pending',
    [ValetStatus.Parked]: 'Parked',
    [ValetStatus.Requested]: 'Pickup Requested',
    [ValetStatus.OnTheWay]: 'On The Way',
    [ValetStatus.Ready]: 'Ready',
    [ValetStatus.Paid]: 'Paid',
    [ValetStatus.Closed]: 'Closed'
  }
  return statusMap[status] || status
}

// 获取来源标签类型
const getSourceType = (source: ValetSource): string => {
  const types: Record<ValetSource, string> = {
    [ValetSource.Online]: 'primary',
    [ValetSource.Offline]: 'success'
  }
  return types[source] || ''
}

// 格式化来源显示
const formatSource = (source: ValetSource): string => {
  const sourceMap: Record<ValetSource, string> = {
    [ValetSource.Online]: 'Online',
    [ValetSource.Offline]: 'Offline'
  }
  return sourceMap[source] || source
}

// 获取司机状态标签类型
const getDriverStatusType = (status: string): string => {
  const types: Record<string, string> = {
    available: 'success',
    busy: 'warning',
    offline: 'info'
  }
  return types[status] || 'info'
}

// 格式化司机状态
const formatDriverStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    available: 'Available',
    busy: 'Busy',
    offline: 'Offline'
  }
  return statuses[status] || status
}

// 格式化照片类型
const formatPhotoType = (type: string): string => {
  const types: Record<string, string> = {
    front: 'Front View',
    rear: 'Rear View',
    left: 'Left Side',
    right: 'Right Side',
    license: 'License Plate'
  }
  return types[type] || type
}

// 检查是否有车辆照片
const hasVehiclePhotos = computed(() => {
  return order.value?.photos && Object.keys(order.value.photos).length > 0
})

// 计算小计金额
const calculateSubtotal = () => {
  if (!order.value) return 0
  const parkingFee = order.value.parkingFee || 0
  const serviceFee = order.value.serviceFee || 0
  const tax = order.value.tax || 0
  return parkingFee + serviceFee + tax
}

// 加载订单数据
const loadOrder = async () => {
  const id = route.params.id as string
  if (!id) return
  
  try {
    loading.value = true
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 从 mockValetOrders 中获取订单数据
    const foundOrder = mockValetOrders[id]
    if (!foundOrder) {
      ElMessage.error('Order not found')
      router.push('/valet')
      return
    }

    order.value = { ...foundOrder }

  } catch (error) {
    console.error('Failed to load order:', error)
    ElMessage.error('Failed to load order details')
  } finally {
    loading.value = false
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  loadOrder()
})

// 处理 Check In - 仅确认到场
const handleCheckIn = async (order: ValetOrder) => {
  try {
    await ElMessageBox.confirm(
      'Confirm customer check-in?',
      'Check In',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    // 更新订单状态
    order.status = ValetStatus.CheckedIn
    order.checkedInAt = new Date().toISOString()
    
    ElMessage.success('Check-in completed')

  } catch (error) {
    console.error('Check-in failed:', error)
    ElMessage.error('Failed to complete check-in')
  }
}

// 处理分配泊车员确认
const handleAssignConfirm = async (driverId: string) => {
  if (!currentOrder.value) return
  
  try {
    // 1. 更新泊车员信息
    currentOrder.value.driverId = driverId
    currentOrder.value.driverAssignedAt = new Date().toISOString()
    
    // 2. 更新订单状态为等待泊车
    currentOrder.value.status = ValetStatus.Pending
    
    // 3. 获取选中的泊车员信息
    const selectedDriverInfo = availableDrivers.value.find(d => d.id === driverId)
    if (selectedDriverInfo) {
      currentOrder.value.driverName = selectedDriverInfo.name
      currentOrder.value.driverPhone = selectedDriverInfo.phone
      currentOrder.value.driverStatus = 'busy'
    }

    // 4. 更新本地数据
    order.value = { ...currentOrder.value }
    
    // 5. 更新 mockValetOrders 中的数据
    if (order.value) {
      mockValetOrders[order.value.id] = { ...order.value }
    }
    
    assignDriverVisible.value = false
    ElMessage.success('Driver assigned and order marked as pending')

    // 6. 刷新页面数据
    await loadOrder()
  } catch (error) {
    console.error('Failed to assign driver:', error)
    ElMessage.error('Failed to assign driver')
  }
}

// 处理泊车完成
const handleParked = async (order: ValetOrder) => {
  try {
    currentOrder.value = order
    parkingSpaceVisible.value = true
  } catch (error) {
    console.error('Failed to mark as parked:', error)
    ElMessage.error('Failed to complete parking')
  }
}

// 处理泊车空间确认
const handleParkingSpaceConfirm = async (data: {
  zoneName: string
  spaceNo: string
  photos: Record<string, string>
}) => {
  if (!currentOrder.value) return

  try {
    // 更新订单信息
    currentOrder.value.zoneName = data.zoneName
    currentOrder.value.spaceNo = data.spaceNo
    currentOrder.value.status = ValetStatus.Parked
    currentOrder.value.parkedAt = new Date().toISOString()
    
    // 更新照片
    if (!currentOrder.value.photos) {
      currentOrder.value.photos = {}
    }
    currentOrder.value.photos = {
      ...currentOrder.value.photos,
      parked_space: data.photos.space,
      parked_full: data.photos.full
    }
    
    // 更新本地数据
    order.value = { ...currentOrder.value }
    
    // 更新 mockValetOrders 中的数据
    if (order.value) {
      mockValetOrders[order.value.id] = { ...order.value }
    }
    
    parkingSpaceVisible.value = false
    ElMessage.success('Vehicle parked successfully')
    
    // 刷新页面数据
    await loadOrder()
  } catch (error) {
    console.error('Failed to mark as parked:', error)
    ElMessage.error('Failed to complete parking')
  }
}

// 计算停车时长(分钟)
const calculateParkingDuration = (order: ValetOrder): number => {
  if (!order.parkedAt) return 0
  const startTime = new Date(order.parkedAt)
  const endTime = order.requestedAt ? new Date(order.requestedAt) : new Date()
  return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
}

// 计算停车费用
const calculateParkingFee = (duration: number, rate: number): number => {
  // 将分钟转换为小时,向上取整
  const hours = Math.ceil(duration / 60)
  return hours * rate
}

// 处理请求取车
const handleRequestPickup = async (order: ValetOrder) => {
  try {
    // 1. 显示取车确认对话框
    const { action } = await ElMessageBox({
      title: 'Request Pickup',
      message: h('div', { class: 'pickup-dialog' }, [
        // 订单信息
        h('div', { class: 'order-info' }, [
          h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, 'Order No:'),
            h('span', { class: 'value highlight' }, order.orderNo)
          ]),
          h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, 'Customer:'),
            h('span', { class: 'value' }, order.customerName)
          ]),
          h('div', { class: 'info-row' }, [
            h('span', { class: 'label' }, 'Phone:'),
            h('span', { class: 'value' }, order.phone)
          ])
        ]),

        // 车辆位置信息（重点突出）
        h('div', { class: 'location-info' }, [
          h('div', { class: 'section-title' }, 'Vehicle Location'),
          h('div', { class: 'location-display' }, [
            h('div', { class: 'zone' }, [
              h('span', { class: 'zone-label' }, 'Zone'),
              h('span', { class: 'zone-value' }, order.zoneName)
            ]),
            h('div', { class: 'space' }, [
              h('span', { class: 'space-label' }, 'Space'),
              h('span', { class: 'space-value' }, order.spaceNo)
            ])
          ])
        ]),

        // 付款状态提醒（如果未付款）
        order.paymentStatus === 'unpaid' && h('div', { class: 'payment-reminder' }, [
          h('el-alert', {
            title: 'Payment Required',
            type: 'warning',
            description: `Please collect payment of $${order.amount?.toFixed(2)} before releasing the vehicle.`,
            showIcon: true,
            closable: false
          })
        ])
      ]),
      confirmButtonText: 'Confirm Pickup',
      cancelButtonText: 'Cancel',
      customClass: 'pickup-request-dialog'
    })

    if (action === 'confirm') {
      // 2. 更新订单状态
      order.status = ValetStatus.Requested
      order.requestedAt = new Date().toISOString()
      
      // 3. 更新本地数据和 mock 数据
      if (order.id) {
        mockValetOrders[order.id] = { ...order }
      }

      ElMessage.success('Pickup request processed')
      await loadOrder() // 刷新页面数据
    }

  } catch (error) {
    if (error === 'cancel') return
    console.error('Failed to request pickup:', error)
    ElMessage.error('Failed to process pickup request')
  }
}

// 处理车辆信息上传
const handleVehicleInfo = async (order: ValetOrder) => {
  try {
    await ElMessageBox.confirm(
      h('div', { class: 'vehicle-photo-dialog' }, [
        h('div', { class: 'dialog-header' }, [
          h('h3', 'Vehicle Inspection Photos'),
          h('p', 'Please take clear photos of all required angles')
        ]),
        h('div', { class: 'photo-grid' }, [
          // 前视图
          h('div', { class: 'photo-item' }, [
            h('div', { class: 'photo-header' }, [
              h('h4', 'Front View'),
              h('span', { class: 'required' }, '* Required')
            ]),
            h('div', { class: 'upload-wrapper' }, [
              h('el-upload', {
                action: '#',
                listType: 'picture-card',
                autoUpload: false,
                limit: 1,
                onChange: (file: any) => {
                  if (!order.photos) order.photos = {}
                  order.photos['front'] = URL.createObjectURL(file.raw)
                }
              }, {
                default: () => [
                  h('div', { class: 'upload-content' }, [
                    h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                    h('div', { class: 'upload-text' }, [
                      h('span', 'Click to Upload'),
                      h('span', { class: 'upload-hint' }, 'Front view of vehicle')
                    ])
                  ])
                ]
              })
            ])
          ]),
          // ... 其他照片项保持类似结构
        ])
      ]),
      {
        title: 'Vehicle Photos',
        confirmButtonText: 'Complete',
        cancelButtonText: 'Cancel',
        customClass: 'vehicle-photo-dialog',
        width: '800px'
      }
    )

    ElMessage.success('Vehicle information updated')

  } catch (error) {
    console.error('Failed to update vehicle info:', error)
    ElMessage.error('Failed to update vehicle information')
  }
}

// 处理 Mark as Pending
const handleMarkPending = async (order: ValetOrder) => {
  try {
    // 1. 先弹出提示确认
    await ElMessageBox.confirm(
      'Please assign a driver to proceed with the valet service.',
      'Mark as Pending',
      {
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    // 2. 使用 AssignDriverDialog 组件
    currentOrder.value = order
    assignDriverVisible.value = true

  } catch (error) {
    console.error('Failed to mark as pending:', error)
    ElMessage.error('Failed to complete operation')
  }
}
</script>

<style scoped lang="scss">
.valet-detail {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .photo-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid #dcdfe6;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #dcdfe6;

    .left {
      display: flex;
      align-items: center;
      gap: 20px;

      .order-no {
        font-size: 20px;
        font-weight: bold;
      }
    }

    .right {
      display: flex;
      gap: 12px;
    }
  }

  .detail-content {
    display: flex;
    gap: 20px;

    .left-content {
      flex: 1;
      min-width: 0;

      .detail-section {
        margin-bottom: 20px;

        h3 {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          display: flex;
          align-items: center;
          gap: 12px;

          .status-tags {
            display: flex;
            gap: 8px;
            margin-left: auto;
            
            .source-tag, .status-tag {
              font-size: 13px;
            }
          }
        }
      }
    }

    .right-content {
      width: 380px;
      flex-shrink: 0;

      .sticky-container {
        position: sticky;
        top: 20px;
        
        .payment-card {
          margin-bottom: 20px;
          padding: 20px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          background-color: #fff;
        }

        .timeline-card {
          padding: 20px;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          background-color: #fff;
        }
      }
    }
  }

  .ml-2 {
    margin-left: 8px;
  }
}

.status-tag {
  margin-left: auto;
  font-size: 14px;
  padding: 6px 12px;
}

.amount {
  font-weight: bold;
  color: #67c23a;
}

.ml-2 {
  margin-left: 8px;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .photo-item {
    h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #606266;
    }

    .el-image {
      width: 100%;
      height: 180px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
    }

    &.license {
      grid-column: span 3;
      
      .el-image {
        height: 120px;
      }
    }

    .image-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #f5f7fa;
      color: #909399;

      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
    }
  }
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  
  &:not(:last-child) {
    border-bottom: 1px dashed #ebeef5;
  }
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #67c23a;
}

.text-gray {
  color: #909399;
  font-style: italic;
}

.ml-2 {
  margin-left: 8px;
}

.timeline-detail {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.source-tag {
  margin-left: auto;
  font-size: 14px;
}

.status-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vehicle-photo-dialog {
  .dialog-header {
    margin-bottom: 24px;
    text-align: center;
    
    h3 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}

.pickup-request-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .order-info {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    .info-row {
      display: flex;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100px;
        color: var(--el-text-color-secondary);
      }

      .value {
        font-weight: 500;
        
        &.highlight {
          color: var(--el-color-primary);
        }
      }
    }
  }

  .location-info {
    margin-bottom: 20px;
    padding: 20px;
    background: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-5);
    border-radius: 8px;

    .section-title {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-color-primary);
    }

    .location-display {
      display: flex;
      gap: 24px;

      .zone,
      .space {
        flex: 1;
        text-align: center;
        padding: 16px;
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        .zone-label,
        .space-label {
          display: block;
          margin-bottom: 8px;
          color: var(--el-text-color-secondary);
          font-size: 14px;
        }

        .zone-value,
        .space-value {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }
    }
  }

  .payment-reminder {
    :deep(.el-alert) {
      margin: 0;
    }
  }
}
</style> 