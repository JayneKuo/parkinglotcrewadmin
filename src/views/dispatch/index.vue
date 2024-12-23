<template>
  <div class="dispatch-container">
    <!-- 顶部统计卡片 -->
    <div class="statistics-wrapper">
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="4" v-for="stat in statistics" :key="stat.label">
          <div :class="['stat-card', stat.type]">
            <div class="stat-content">
              <div class="stat-header">
                <span class="stat-label">{{ stat.label }}</span>
                <el-icon><component :is="getStatIcon(stat.type)" /></el-icon>
              </div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="refresh-card" @click="handleManualRefresh">
            <el-icon :class="{ 'is-loading': refreshing }"><Refresh /></el-icon>
            <span>{{ refreshing ? 'Refreshing...' : 'Refresh' }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 筛选器 -->
      <div class="filters-section">
        <div class="filters-header">
          <h2>Parking Spots Management</h2>
          <div class="filters-right">
            <el-select 
              v-model="selectedParkingLot"
              placeholder="Select Parking Lot"
              class="filter-item"
            >
              <el-option
                v-for="lot in parkingLots"
                :key="lot.id"
                :label="lot.name"
                :value="lot.id"
              >
                <div class="parking-lot-option">
                  <el-icon><Location /></el-icon>
                  <span>{{ lot.name }}</span>
                  <span class="spot-count">{{ getParkingLotSpotCount(lot) }} spots</span>
                </div>
              </el-option>
            </el-select>

            <el-select
              v-model="selectedArea"
              placeholder="Select Area"
              class="filter-item"
              :disabled="!selectedParkingLot"
            >
              <el-option
                v-for="area in availableAreas"
                :key="area.id"
                :label="area.name"
                :value="area.id"
              >
                <div class="area-option">
                  <span>{{ area.name }}</span>
                  <el-tag size="small" type="info">{{ getAreaSpotCount(area) }} spots</el-tag>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- 车位网格 -->
      <div class="spots-grid">
        <div v-for="area in filteredAreas" :key="area.id" class="area-section">
          <div class="area-header">
            <h3>{{ area.name }}</h3>
            <div class="area-stats">
              <el-tag size="small" type="info">{{ getAreaSpotCount(area) }} Spots</el-tag>
              <el-tag 
                size="small" 
                type="success"
              >
                {{ getAreaAvailableCount(area) }} Available
              </el-tag>
            </div>
          </div>

          <el-row :gutter="20">
            <el-col 
              :span="6" 
              v-for="spot in area.spots" 
              :key="spot.id"
            >
              <div :class="['spot-card', spot.status.toLowerCase()]">
                <div class="spot-header">
                  <span class="spot-id">{{ spot.id }}</span>
                  <el-tag 
                    :type="getStatusType(spot.status)"
                    :effect="spot.isOvertime ? 'dark' : 'light'"
                    class="status-tag"
                  >
                    {{ formatStatus(spot.status) }}
                    <el-icon v-if="spot.isOvertime" class="overtime-icon"><Warning /></el-icon>
                  </el-tag>
                </div>

                <div class="spot-content">
                  <!-- 已占用状态 -->
                  <template v-if="spot.status === SpotStatus.Occupied">
                    <div class="vehicle-info">
                      <div class="main-info">
                        <div class="plate">{{ spot.vehiclePlate }}</div>
                        <div class="duration">
                          <el-icon><Timer /></el-icon>
                          {{ formatDuration(spot.duration) }}
                          <span v-if="spot.isOvertime" class="overtime">
                            <el-icon><Warning /></el-icon>
                            {{ formatDuration(spot.overtime) }}
                          </span>
                        </div>
                      </div>
                      <!-- 修改下一个预约提示的样式 -->
                      <div v-if="spot.nextReservation" class="next-reservation-compact">
                        <el-icon><Calendar /></el-icon>
                        <span class="next-label">Next:</span>
                        <span class="next-time">{{ spot.nextReservation.startTime }}</span>
                        <span class="divider">|</span>
                        <span class="next-user">{{ spot.nextReservation.reservedFor }}</span>
                      </div>
                    </div>
                  </template>

                  <!-- 可用状态 -->
                  <template v-else-if="spot.status === SpotStatus.Available">
                    <div class="availability-info">
                      <!-- 完全可用 -->
                      <template v-if="!checkSpotAvailability(spot).hasUpcomingReservation">
                        <div class="fully-available">
                          <el-icon><CircleCheck /></el-icon>
                          <span>Fully available</span>
                        </div>
                      </template>
                      <!-- 部分可用(有未来预约) -->
                      <template v-else>
                        <div class="next-reservation-info">
                          <el-icon><Calendar /></el-icon>
                          <div class="reservation-details">
                            <div class="time-info">
                              <span class="label">Available for:</span>
                              <el-tag 
                                size="small"
                                :type="checkSpotAvailability(spot).availableTime.isLimited ? 'warning' : 'success'"
                              >
                                {{ checkSpotAvailability(spot).availableTime.formatted }}
                              </el-tag>
                            </div>
                            <div class="next-info">
                              <span class="label">Next:</span>
                              <span class="time">{{ checkSpotAvailability(spot).nextReservation.startTime }}</span>
                              <span class="reserved-for">{{ checkSpotAvailability(spot).nextReservation.reservedFor }}</span>
                            </div>
                          </div>
                        </div>
                      </template>
                    </div>
                  </template>

                  <!-- 预约状态 -->
                  <template v-else-if="spot.status === SpotStatus.Reserved">
                    <div class="reservation-info">
                      <div class="current-reservation">
                        <div class="time">
                          <el-icon><Calendar /></el-icon>
                          {{ spot.reservationTime }}
                        </div>
                        <div class="user">
                          <el-icon><User /></el-icon>
                          {{ spot.reservedFor }}
                        </div>
                        <!-- 添加最大可用时长显示 -->
                        <div class="max-duration" v-if="spot.nextReservation?.maxAvailableDuration">
                          <el-icon><Timer /></el-icon>
                          Max Available: {{ formatMaxDuration(spot.nextReservation.maxAvailableDuration) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>

                <div class="spot-actions">
                  <el-dropdown 
                    @command="(command: string) => handleSpotAction(command, spot)"
                    trigger="click"
                  >
                    <el-button type="primary" size="small" class="action-button">
                      Actions
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="action in getAvailableActions(spot.status)"
                          :key="action.action"
                          :command="action.action"
                        >
                          <el-icon><component :is="action.icon" /></el-icon>
                          {{ action.label }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <!-- 入场弹窗 -->
    <entry-dialog
      v-model="entryDialogVisible"
      :spot="selectedSpot"
      @confirm="handleEntryConfirm"
    />

    <!-- 出场弹窗 -->
    <exit-dialog
      v-model="exitDialogVisible"
      :spot="selectedSpot"
      @confirm="handleExitConfirm"
    />

    <!-- 转移弹窗 -->
    <transfer-dialog
      v-model="transferDialogVisible"
      :spot="selectedSpot"
      :available-spots="getAvailableSpots()"
      @confirm="handleTransferConfirm"
    />

    <!-- 查看详情弹窗 -->
    <view-details-dialog
      v-model="viewDetailsDialogVisible"
      :spot="selectedSpot"
    />

    <!-- 超时出场弹窗 -->
    <overtime-exit-dialog
      v-model="overtimeExitDialogVisible"
      :spot="selectedSpot"
      @confirm="handleOvertimeExitConfirm"
      @skip="handleSkipPayment"
    />

    <!-- 预约历史弹窗 -->
    <reservation-history-dialog
      v-model="reservationHistoryVisible"
      :spot="selectedSpot"
      @start-parking="handleReservationParking"
      @cancel-reservation="handleCancelReservation"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, Lock, View, Close, Right, Unlock, Timer, Calendar, Warning, User, Location, ArrowDown, CircleCheck } from '@element-plus/icons-vue'
import EntryDialog from './components/EntryDialog.vue'
import ExitDialog from './components/ExitDialog.vue'
import TransferDialog from './components/TransferDialog.vue'
import ViewDetailsDialog from './components/ViewDetailsDialog.vue'
import OvertimeExitDialog from './components/OvertimeExitDialog.vue'
import ReservationHistoryDialog from './components/ReservationHistoryDialog.vue'
import { SpotStatus, ParkingSpot, ParkingArea, ParkingLot } from '@/types/dispatch'

// 状态统计数据
const statistics = ref([
  { label: 'Total Spots', value: 0, type: 'total' },
  { label: 'Available', value: 0, type: 'available' },
  { label: 'Occupied', value: 0, type: 'occupied' },
  { label: 'Reserved', value: 0, type: 'reserved' },
  { label: 'Locked', value: 0, type: 'locked' }
])

// 刷新相关
const refreshing = ref(false)
const refreshInterval = ref<number>()

// 区域和车位数据
const areas = ref<ParkingArea[]>([
  {
    id: 'A',
    name: 'Zone A',
    parkingLotId: 'P1',
    spots: [
      {
        id: 'A-01',
        status: SpotStatus.Available,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      },
      {
        id: 'A-02',
        status: SpotStatus.Occupied,
        vehiclePlate: 'ABC1234',
        duration: 125,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer',
        nextReservation: {
          startTime: '14:30',
          endTime: '16:30',
          reservedFor: 'Mike Johnson',
          timeUntil: '1h 25m'
        }
      },
      {
        id: 'A-03',
        status: SpotStatus.Reserved,
        vehiclePlate: '',
        reservationTime: '14:00 - 16:00',
        reservedFor: 'John Smith (123-456-7890)',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer',
        nextReservation: {
          startTime: '2024-03-20 16:00',
          endTime: '2024-03-20 18:00',
          timeUntil: 'in 2h',
          maxAvailableDuration: 120
        }
      },
      {
        id: 'A-04',
        status: SpotStatus.Locked,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      }
    ]
  },
  {
    id: 'B',
    name: 'Zone B',
    parkingLotId: 'P1',
    spots: [
      {
        id: 'B-01',
        status: SpotStatus.Available,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      },
      {
        id: 'B-02',
        status: SpotStatus.Occupied,
        vehiclePlate: 'XYZ9876',
        duration: 185,
        overtime: 65,
        isOvertime: true,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer',
        nextReservation: {
          startTime: '15:30',
          endTime: '17:30',
          reservedFor: 'Jane Doe',
          timeUntil: '2h 25m'
        }
      },
      {
        id: 'B-03',
        status: SpotStatus.Available,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      }
    ]
  },
  {
    id: 'C',
    name: 'Zone C',
    parkingLotId: 'P2',
    spots: [
      {
        id: 'C-01',
        status: SpotStatus.Occupied,
        vehiclePlate: 'DEF5678',
        duration: 45,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      },
      {
        id: 'C-02',
        status: SpotStatus.Reserved,
        vehiclePlate: '',
        reservationTime: '15:00 - 17:00',
        reservedFor: 'Jane Doe (098-765-4321)',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'Jane Doe',
          phone: '098-765-4321'
        },
        notes: 'Regular customer'
      },
      {
        id: 'C-03',
        status: SpotStatus.Available,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      },
      {
        id: 'C-04',
        status: SpotStatus.Locked,
        vehiclePlate: '',
        duration: 0,
        overtime: 0,
        isOvertime: false,
        entryTime: '2024-03-20 09:00:00',
        driver: {
          name: 'John Smith',
          phone: '123-456-7890'
        },
        notes: 'Regular customer'
      }
    ]
  }
])

const selectedArea = ref('')

// 弹窗控制
const entryDialogVisible = ref(false)
const exitDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const selectedSpot = ref<ParkingSpot | null>(null)
const viewDetailsDialogVisible = ref(false)
const overtimeExitDialogVisible = ref(false)
const reservationHistoryVisible = ref(false)

// 计算过滤后的区域
const filteredAreas = computed(() => {
  let filtered = areas.value

  // 按车场筛选
  if (selectedParkingLot.value) {
    filtered = filtered.filter(area => area.parkingLotId === selectedParkingLot.value)
  }

  // 按区域筛选
  if (selectedArea.value) {
    filtered = filtered.filter(area => area.id === selectedArea.value)
  }

  return filtered
})

// 计算可选区域
const availableAreas = computed(() => {
  if (!selectedParkingLot.value) return areas.value
  return areas.value.filter(area => area.parkingLotId === selectedParkingLot.value)
})

// 手动刷新
const handleManualRefresh = async () => {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await loadData()
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('数据刷新失败，请稍后重试')
  } finally {
    refreshing.value = false
  }
}

// 修改自动刷新和时间更新的实现
const setupAutoRefresh = () => {
  // 每分钟更新时间和预约信息
  const updateInterval = window.setInterval(() => {
    updateDurations()
    updateNextReservations()
  }, 60000)

  // 返回清理函数
  return () => {
    clearInterval(updateInterval)
  }
}

// 修改生命周期钩子
onMounted(() => {
  loadData()
  const cleanup = setupAutoRefresh()
  onUnmounted(cleanup)
})

// 加载数据
const loadData = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新统计数据
    updateStatistics()
  } catch (error) {
    ElMessage.error('数据加载失败，请刷新页面重试')
    throw error
  }
}

// 工具函数
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

const getSpotStatusType = (status: string) => {
  const types = {
    Available: 'success',
    Occupied: 'danger',
    Reserved: 'warning',
    Locked: 'info'
  }
  return types[status] || 'info'
}

const getAvailableActions = (status: string) => {
  const actions = {
    Available: [
      { action: 'entry', label: 'Vehicle Entry', icon: 'Plus' },
      { action: 'lock', label: 'Lock Spot', icon: 'Lock' },
      { action: 'history', label: 'Reservation History', icon: 'Calendar' },
      { action: 'view', label: 'View Details', icon: 'View' }
    ],
    Occupied: [
      { action: 'exit', label: 'Vehicle Exit', icon: 'Close' },
      { action: 'transfer', label: 'Transfer', icon: 'Right' },
      { action: 'history', label: 'Reservation History', icon: 'Calendar' },
      { action: 'view', label: 'View Details', icon: 'View' }
    ],
    Reserved: [
      { action: 'entry', label: 'Vehicle Entry', icon: 'Plus' },
      { action: 'cancel', label: 'Cancel Reservation', icon: 'Close' },
      { action: 'history', label: 'Reservation History', icon: 'Calendar' },
      { action: 'view', label: 'View Details', icon: 'View' }
    ],
    Locked: [
      { action: 'unlock', label: 'Unlock Spot', icon: 'Unlock' },
      { action: 'view', label: 'View Details', icon: 'View' }
    ]
  }
  return actions[status] || []
}

// 错误处理
const handleError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error)
  
  if (error.response?.status === 401) {
    ElMessage.error('Session expired, please login again')
    // TODO: 重定向到登录页
    return
  }

  if (error.response?.status === 403) {
    ElMessage.error('Permission denied')
    return
  }

  const messages = {
    'load': '加载数据失败，请重试。',
    'entry': '车辆入场失败，请重试。',
    'exit': '车辆出场失败，请重试。',
    'transfer': '车位转移失败，请重试。',
    'payment': '支付处理失败，请重试。',
    'network': '网络连接异常，请检查网络。'
  }

  ElMessage.error(messages[operation] || '操作失败，请稍后重试。')
}

// 统一的操作处理
const handleSpotAction = async (action: string, spot: ParkingSpot) => {
  selectedSpot.value = spot

  switch (action) {
    case 'entry':
      entryDialogVisible.value = true
      break
    case 'exit':
      if (spot.isOvertime) {
        overtimeExitDialogVisible.value = true
      } else {
        await handleNormalExit(spot)
      }
      break
    case 'transfer':
      transferDialogVisible.value = true
      break
    case 'view':
      viewDetailsDialogVisible.value = true
      break
    case 'history':
      reservationHistoryVisible.value = true
      break
    case 'cancel':
      await handleCancelReservation(spot)
      break
    case 'lock':
      await handleLockSpot(spot)
      break
    case 'unlock':
      await handleUnlockSpot(spot)
      break
  }
}

// 锁定车位
const handleLockSpot = async (spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to lock spot ${spot.id}?`,
      'Lock Confirmation',
      {
        confirmButtonText: 'Lock',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    // TODO: 调用API锁定车位
    spot.status = 'Locked'
    ElMessage.success('Spot locked successfully')
    updateStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to lock spot')
    }
  }
}

// 解锁车位
const handleUnlockSpot = async (spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to unlock spot ${spot.id}?`,
      'Unlock Confirmation',
      {
        confirmButtonText: 'Unlock',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    // TODO: 调用API解锁车位
    spot.status = 'Available'
    ElMessage.success('Spot unlocked successfully')
    updateStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to unlock spot')
    }
  }
}

// 取消预订
const handleCancelReservation = async (spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Cancel reservation for ${spot.reservedFor}?`,
      'Cancel Reservation',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Keep',
        type: 'warning'
      }
    )

    spot.status = SpotStatus.Available
    spot.reservedFor = ''
    spot.reservationTime = ''
    spot.driver = undefined
    ElMessage.success('Reservation cancelled successfully')
    updateStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to cancel reservation')
    }
  }
}

// 查看详情
const handleViewDetails = (spot: ParkingSpot) => {
  selectedSpot.value = {
    ...spot,
    area: areas.value.find(area => 
      area.spots.find(s => s.id === spot.id)
    )?.name
  }
  viewDetailsDialogVisible.value = true
}

// 修改入场确认处理
const handleEntryConfirm = async (data: any) => {
  try {
    // TODO: 调用API处理入场
    const spot = areas.value
      .find(area => area.spots.find(s => s.id === data.spotId))
      ?.spots.find(s => s.id === data.spotId)
    
    if (spot) {
      spot.status = 'Occupied'
      spot.vehiclePlate = data.plate
      spot.duration = 0
      spot.overtime = 0
      spot.isOvertime = false
      ElMessage.success('Vehicle entry successful')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to process vehicle entry')
  }
}

// 修改出场确认处理
const handleExitConfirm = async (data: any) => {
  try {
    // TODO: 调用API处理出场
    const spot = areas.value
      .find(area => area.spots.find(s => s.id === data.spotId))
      ?.spots.find(s => s.id === data.spotId)
    
    if (spot) {
      spot.status = 'Available'
      spot.vehiclePlate = ''
      spot.duration = 0
      spot.overtime = 0
      spot.isOvertime = false
      ElMessage.success('Vehicle exit successful')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to process vehicle exit')
  }
}

// 修改转移确认处理
const handleTransferConfirm = async (data: any) => {
  try {
    // TODO: 调用API处理转移
    const sourceSpot = areas.value
      .find(area => area.spots.find(s => s.id === data.sourceSpotId))
      ?.spots.find(s => s.id === data.sourceSpotId)
    
    const targetSpot = areas.value
      .find(area => area.spots.find(s => s.id === data.targetSpotId))
      ?.spots.find(s => s.id === data.targetSpotId)
    
    if (sourceSpot && targetSpot) {
      // 交换状态和车辆信息
      targetSpot.status = 'Occupied'
      targetSpot.vehiclePlate = sourceSpot.vehiclePlate
      targetSpot.duration = sourceSpot.duration
      targetSpot.overtime = sourceSpot.overtime
      targetSpot.isOvertime = sourceSpot.isOvertime

      // 清空源车位信息
      sourceSpot.status = 'Available'
      sourceSpot.vehiclePlate = ''
      sourceSpot.duration = 0
      sourceSpot.overtime = 0
      sourceSpot.isOvertime = false

      ElMessage.success('Vehicle transferred successfully')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to transfer vehicle')
  }
}

// 添加getAreaSpotCount函数
const getAreaSpotCount = (area: ParkingArea) => {
  return area.spots?.length || 0
}

// 添加getAvailableSpots函数
const getAvailableSpots = () => {
  return areas.value.flatMap(area => 
    area.spots.filter(spot => spot.status === SpotStatus.Available)
  )
}

// 修改统计数据的计算方法
const updateStatistics = () => {
  let total = 0
  let available = 0
  let occupied = 0
  let reserved = 0
  let locked = 0

  areas.value.forEach(area => {
    area.spots.forEach(spot => {
      total++
      switch (spot.status) {
        case 'Available':
          available++
          break
        case 'Occupied':
          occupied++
          break
        case 'Reserved':
          reserved++
          break
        case 'Locked':
          locked++
          break
      }
    })
  })

  statistics.value = [
    { label: 'Total Spots', value: total, type: 'total' },
    { label: 'Available', value: available, type: 'available' },
    { label: 'Occupied', value: occupied, type: 'occupied' },
    { label: 'Reserved', value: reserved, type: 'reserved' },
    { label: 'Locked', value: locked, type: 'locked' }
  ]
}

// 添加车场数据
const parkingLots = ref<ParkingLot[]>([
  {
    id: 'P1',
    name: 'Main Parking',
    areas: ['A', 'B'],
    address: '123 Main Street',
    capacity: 50
  },
  {
    id: 'P2',
    name: 'East Parking',
    areas: ['C'],
    address: '456 East Avenue',
    capacity: 30
  }
])

// 添加选中的车场
const selectedParkingLot = ref('')

// 获取统计图标
const getStatIcon = (type: string) => {
  const icons = {
    total: 'DataLine',
    available: 'CircleCheck',
    occupied: 'Van',
    reserved: 'Calendar',
    locked: 'Lock'
  }
  return icons[type]
}

// 获取区域可用车位数
const getAreaAvailableCount = (area: ParkingArea) => {
  return area.spots.filter(spot => spot.status === 'Available').length
}

// 获取停车场车位总数
const getParkingLotSpotCount = (lot: ParkingLot) => {
  return areas.value
    .filter(area => area.parkingLotId === lot.id)
    .reduce((total, area) => total + getAreaSpotCount(area), 0)
}

// 添加模拟的定时更新功能
const updateDurations = () => {
  areas.value.forEach(area => {
    area.spots.forEach(spot => {
      if (spot.status === SpotStatus.Occupied) {
        // 增加停留时间
        spot.duration += 1
        
        // 检查是否超时(假设2小时为限)
        if (spot.duration > 120) {
          spot.isOvertime = true
          spot.overtime = spot.duration - 120
        }
      }
    })
  })
  
  // 更新统计数据
  updateStatistics()
}

// 添加超时出场弹窗组件
const handleOvertimeExitConfirm = async (data: any) => {
  try {
    // TODO: 调用API处理支付和出场
    const spot = areas.value
      .find(area => area.spots.find(s => s.id === data.spotId))
      ?.spots.find(s => s.id === data.spotId)
    
    if (spot) {
      spot.status = 'Available'
      spot.vehiclePlate = ''
      spot.duration = 0
      spot.overtime = 0
      spot.isOvertime = false
      spot.isPaid = true
      ElMessage.success('Payment successful and vehicle exited')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to process payment and exit')
  }
}

const handleSkipPayment = async (data: any) => {
  try {
    // TODO: 调用API处理出场但标记未支付
    const spot = areas.value
      .find(area => area.spots.find(s => s.id === data.spotId))
      ?.spots.find(s => s.id === data.spotId)
    
    if (spot) {
      spot.status = 'Available'
      spot.vehiclePlate = ''
      spot.duration = 0
      spot.overtime = 0
      spot.isOvertime = false
      spot.isPaid = false
      ElMessage.warning('Vehicle exited but payment is pending')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to process exit')
  }
}

// 状态优先级排序
const statusPriority = {
  [SpotStatus.Occupied]: 1,
  [SpotStatus.Reserved]: 2,
  [SpotStatus.Available]: 3,
  [SpotStatus.Locked]: 4
}

// 排序方法
const sortByStatus = (a: ParkingSpot, b: ParkingSpot) => {
  const priorityA = statusPriority[a.status] || 999
  const priorityB = statusPriority[b.status] || 999
  return priorityA - priorityB
}

// 对区域内的车位进行排序
const sortedAreas = computed(() => {
  return areas.value.map(area => ({
    ...area,
    spots: [...area.spots].sort(sortByStatus)
  }))
})

// 状态变更处理
const handleStatusChange = async (spot: ParkingSpot, newStatus: SpotStatus) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to change status to ${formatStatus(newStatus)}?`,
      'Change Status',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    spot.status = newStatus
    ElMessage.success('Status updated successfully')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to update status')
    }
  }
}

// 操作校验
const canPerformAction = (spot: ParkingSpot, action: string) => {
  const actionMap = {
    [SpotStatus.Occupied]: ['exit', 'transfer', 'view'],
    [SpotStatus.Reserved]: ['view', 'cancel'],
    [SpotStatus.Available]: ['entry', 'lock', 'view'],
    [SpotStatus.Locked]: ['unlock', 'view']
  }

  return actionMap[spot.status]?.includes(action) || false
}

// Add status formatting method
const formatStatus = (status: SpotStatus) => {
  const statusMap = {
    [SpotStatus.Available]: 'Available',
    [SpotStatus.Occupied]: 'Occupied',
    [SpotStatus.Reserved]: 'Reserved',
    [SpotStatus.Locked]: 'Locked'
  }
  return statusMap[status] || status
}

// Add status type method
const getStatusType = (status: SpotStatus) => {
  const typeMap = {
    [SpotStatus.Available]: 'success',
    [SpotStatus.Occupied]: 'danger',
    [SpotStatus.Reserved]: 'warning',
    [SpotStatus.Locked]: 'info'
  }
  return typeMap[status] || 'info'
}

// Update normal exit handler
const handleNormalExit = async (spot: ParkingSpot) => {
  try {
    await ElMessageBox.confirm(
      `Confirm exit for vehicle ${spot.vehiclePlate}?`,
      'Exit Confirmation',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    await handleExitConfirm({
      spotId: spot.id,
      plate: spot.vehiclePlate
    })
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to process vehicle exit')
    }
  }
}

// 添加预约相关的处理方法
const handleReservationParking = async (data: { spotId: string, reservationId: string }) => {
  try {
    const spot = getAllSpots().find(s => s.id === data.spotId)
    if (spot) {
      spot.status = SpotStatus.Occupied
      spot.duration = 0
      spot.overtime = 0
      spot.isOvertime = false
      ElMessage.success('Parking started successfully')
      updateStatistics()
    }
  } catch (error) {
    ElMessage.error('Failed to start parking')
  }
}

// 计算每个车位的下一个预约信息
const updateNextReservations = () => {
  const now = new Date()
  
  areas.value.forEach(area => {
    area.spots.forEach(spot => {
      // 获取未来的预约
      const futureReservations = spot.reservations
        .filter(r => new Date(r.startTime) > now && r.status === ReservationStatus.Upcoming)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

      if (futureReservations.length > 0) {
        const nextReservation = futureReservations[0]
        const startTime = new Date(nextReservation.startTime)
        
        // 计算距离下一个预约的时间
        const timeUntil = formatTimeUntil(startTime)
        
        // 计算当前最大可用时间(分钟)
        const maxAvailableDuration = Math.floor((startTime.getTime() - now.getTime()) / (1000 * 60))
        
        spot.nextReservation = {
          startTime: nextReservation.startTime,
          endTime: nextReservation.endTime,
          timeUntil,
          maxAvailableDuration
        }
      } else {
        spot.nextReservation = undefined
      }
    })
  })
}

// 格式化距离下一个预约的时间
const formatTimeUntil = (date: Date) => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} days`
  }
  
  if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  }
  
  return `in ${minutes}m`
}

// 添加工具函数来判断车位可用性
const checkSpotAvailability = (spot: ParkingSpot, minimumHours = 1): {
  isAvailable: boolean
  nextReservation?: {
    startTime: string
    timeUntil: string
    duration: number // 从现在到预约开始的可用时长(分钟)
  }
} => {
  const now = new Date()
  
  // 如果车位不是Available状态，直接返回不可用
  if (spot.status !== SpotStatus.Available) {
    return { isAvailable: false }
  }

  // 获取今天和未来的预约
  const upcomingReservations = (spot.reservations || [])
    .filter(r => {
      const reservationTime = new Date(r.startTime)
      return r.status === ReservationStatus.Upcoming && reservationTime >= now
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // 如果没有预约，车位完全可用
  if (upcomingReservations.length === 0) {
    return { isAvailable: true }
  }

  // 获取最近的预约
  const nextReservation = upcomingReservations[0]
  const reservationStart = new Date(nextReservation.startTime)
  
  // 计算到下一个预约的时间（分钟）
  const availableMinutes = Math.floor((reservationStart.getTime() - now.getTime()) / (1000 * 60))
  
  // 如果距离下一个预约的时间小于最小要求时间，则视为不可用
  const isAvailable = availableMinutes >= (minimumHours * 60)

  return {
    isAvailable,
    nextReservation: {
      startTime: nextReservation.startTime,
      timeUntil: formatTimeUntil(reservationStart),
      duration: availableMinutes
    }
  }
}

// 添加辅助方法
const getAvailabilityTagType = (status: string) => {
  const types = {
    fully: 'success',
    limited: 'warning',
    unavailable: 'danger'
  }
  return types[status] || 'info'
}

const getAvailabilityHint = (status: string) => {
  const hints = {
    limited: 'Limited time available',
    unavailable: 'Too close to next reservation'
  }
  return hints[status] || ''
}

// 修改 formatMaxDuration 方法
const formatMaxDuration = (minutes?: number) => {
  if (!minutes) return 'Unlimited';
  
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) { // 24 hours
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  } else { // more than 24 hours
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }
}
</script>

<style scoped lang="scss">
.dispatch-container {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;

  .statistics-wrapper {
    margin-bottom: 24px;

    .stat-card {
      padding: 24px;
      border-radius: 16px;
      background: linear-gradient(145deg, var(--gradient-start), var(--gradient-end));
      
      &.total {
        --gradient-start: #1890ff;
        --gradient-end: #096dd9;
      }
      
      &.available {
        --gradient-start: #52c41a;
        --gradient-end: #389e0d;
      }
      
      &.occupied {
        --gradient-start: #f5222d;
        --gradient-end: #cf1322;
      }
      
      &.reserved {
        --gradient-start: #fa8c16;
        --gradient-end: #d46b08;
      }
      
      &.locked {
        --gradient-start: #8c8c8c;
        --gradient-end: #595959;
      }

      .stat-content {
        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .stat-label {
            font-size: 14px;
            color: rgba(255,255,255,0.85);
          }

          .el-icon {
            font-size: 20px;
            color: rgba(255,255,255,0.85);
          }
        }

        .stat-value {
          font-size: 32px;
          font-weight: 600;
          color: white;
        }
      }
    }

    .refresh-card {
      height: 100%;
      background: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #f0f2f5;
      }

      .el-icon {
        font-size: 24px;
        color: #606266;
        margin-bottom: 8px;
      }

      span {
        font-size: 14px;
        color: #606266;
      }

      .is-loading {
        animation: rotating 2s linear infinite;
      }
    }
  }

  .main-content {
    background: white;
    border-radius: 12px;
    padding: 24px;

    .filters-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;

      .filter-item {
        width: 200px;
      }
    }

    .area-section {
      margin-bottom: 32px;

      .area-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 18px;
          margin-right: 16px;
        }

        .area-stats {
          display: flex;
          gap: 8px;
        }
      }

      .spot-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        margin-bottom: 20px;
        border: 2px solid transparent;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }

        .spot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .spot-id {
            font-size: 18px;
            font-weight: 600;
          }
        }

        .spot-content {
          min-height: 60px;
          margin-bottom: 16px;

          .vehicle-info,
          .reservation-info {
            .plate {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .duration,
            .time,
            .user {
              display: flex;
              align-items: center;
              gap: 6px;
              color: #606266;
              font-size: 13px;

              .el-icon {
                font-size: 14px;
              }
            }

            .overtime {
              color: #F56C6C;
              margin-left: 8px;
            }
          }
        }

        .spot-actions {
          display: flex;
          justify-content: flex-end;

          .action-button {
            min-width: 100px;
          }
        }
      }
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  .overtime-icon {
    color: #F56C6C;
  }
}

// 不同状态的样式
.spot-card {
  &.active {
    border-color: #67C23A;
  }
  
  &.leave {
    border-color: #E6A23C;
    opacity: 0.8;
  }
  
  &.suspended {
    border-color: #F56C6C;
    opacity: 0.7;
  }
  
  &.inactive {
    border-color: #909399;
    opacity: 0.6;
  }
}

.availability-info {
  padding: 8px 0;

  .next-reservation-warning {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: var(--el-text-color-regular);

    .el-icon {
      color: var(--el-color-warning);
      margin-top: 2px;
    }

    .reservation-details {
      .time {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hint {
        font-size: 12px;
        color: var(--el-color-danger);
      }
    }
  }

  .fully-available {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--el-color-success);

    .el-icon {
      font-size: 16px;
    }
  }
}

.next-reservation-hint {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  .hint-content {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .time {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }
}

.availability-info {
  .next-reservation-info {
    .time-info {
      margin-bottom: 8px;
    }

    .next-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
      
      .time {
        font-weight: 500;
      }
      
      .reserved-for {
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.reservation-info {
  .current-reservation {
    // ... 现有样式 ...
    
    .max-duration {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 13px;
      color: var(--el-color-success);
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.vehicle-info {
  .main-info {
    margin-bottom: 8px;
    
    .plate {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .duration {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #606266;
      font-size: 13px;

      .el-icon {
        font-size: 14px;
      }

      .overtime {
        color: #F56C6C;
        margin-left: 8px;
      }
    }
  }

  .next-reservation-compact {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    padding: 4px 8px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;

    .el-icon {
      color: var(--el-color-warning);
      font-size: 12px;
    }

    .next-time {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }

    .divider {
      color: var(--el-border-color);
      margin: 0 4px;
    }

    .next-user {
      color: var(--el-text-color-secondary);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>