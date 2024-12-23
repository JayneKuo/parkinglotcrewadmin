<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`Reservation History - ${spot?.id}`"
    width="900px"
    class="reservation-history-dialog"
  >
    <!-- 添加车位状态信息区域 -->
    <div v-if="spot?.status === SpotStatus.Reserved" class="spot-info">
      <el-tag type="warning" effect="light">Reserved</el-tag>
      <span class="max-duration">
        最大可用时长: {{ formatMaxDuration(spot.nextReservation?.maxAvailableDuration) }}
      </span>
    </div>

    <!-- 搜索工具栏 -->
    <div class="search-bar">
      <div class="left">
        <el-input
          v-model="searchQuery"
          placeholder="Search by name or phone"
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <div class="date-range">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            :shortcuts="dateShortcuts"
            class="date-picker"
          />
        </div>
      </div>

      <div class="status-tabs">
        <el-radio-group v-model="statusFilter" size="default">
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="Upcoming">Upcoming</el-radio-button>
          <el-radio-button label="Completed">Completed</el-radio-button>
          <el-radio-button label="Cancelled">Cancelled</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 预约列表 -->
    <div class="reservation-list">
      <el-table
        v-loading="loading"
        :data="filteredHistory"
        style="width: 100%"
      >
        <el-table-column label="Time Slot" min-width="180">
          <template #default="{ row }">
            <div class="time-slot">
              <el-icon><Calendar /></el-icon>
              <div class="time-info">
                <span class="date">{{ formatDate(row.startTime) }}</span>
                <span class="time">{{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}</span>
                <span v-if="props.spot.status === SpotStatus.Reserved && row.status === ReservationStatus.Upcoming" 
                      class="max-duration">
                  最大可用时长: {{ formatMaxDuration(props.spot.nextReservation?.maxAvailableDuration) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Customer Info" min-width="200">
          <template #default="{ row }">
            <div class="customer-info">
              <span class="name">{{ row.reservedFor }}</span>
              <span class="phone">{{ row.phone }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Status" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              :effect="row.status === ReservationStatus.Upcoming ? 'dark' : 'plain'"
              class="status-tag"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Notes" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="notes">
              <el-icon><Document /></el-icon>
              <span>{{ row.notes || 'No notes' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Actions" width="120" fixed="right">
          <template #default="{ row }">
            <div class="actions">
              <template v-if="row.status === ReservationStatus.Upcoming">
                <el-button
                  type="primary"
                  link
                  @click="handleStartParking(row)"
                >
                  Start
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleCancelReservation(row)"
                >
                  Cancel
                </el-button>
              </template>
              <el-button
                type="info"
                link
                @click="handleViewDetails(row)"
              >
                Details
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <el-empty
            description="No reservations found"
            :image-size="100"
          >
            <template #description>
              <p>{{ getEmptyDescription() }}</p>
            </template>
          </el-empty>
        </template>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Calendar,
  Search,
  Document,
  View,
  Delete,
  More
} from '@element-plus/icons-vue'
import { ParkingSpot, ReservationStatus, ReservationHistory, SpotStatus } from '@/types/dispatch'
import { format } from 'date-fns'

const props = defineProps<{
  modelValue: boolean
  spot: ParkingSpot
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'start-parking', data: { spotId: string, reservationId: string }): void
  (e: 'cancel-reservation', reservationId: string): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<string>('all')
const dateRange = ref<[Date, Date] | null>(null)

// Date shortcuts
const dateShortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 模拟预定历史数据
const reservationHistory = computed<ReservationHistory[]>(() => [
  {
    startTime: '2024-03-20 14:00',
    endTime: '2024-03-20 16:00',
    reservedFor: 'John Smith',
    phone: '123-456-7890',
    status: ReservationStatus.Upcoming,
    notes: 'Regular customer'
  },
  {
    startTime: '2024-03-19 10:00',
    endTime: '2024-03-19 12:00',
    reservedFor: 'Jane Doe',
    phone: '098-765-4321',
    status: ReservationStatus.Completed,
    notes: 'VIP customer'
  },
  {
    startTime: '2024-03-18 15:00',
    endTime: '2024-03-18 17:00',
    reservedFor: 'Mike Johnson',
    phone: '555-123-4567',
    status: ReservationStatus.Cancelled,
    notes: 'Cancelled due to weather'
  }
])

// Filter and search logic
const filteredHistory = computed(() => {
  let result = reservationHistory.value

  // Status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(r => r.status === statusFilter.value)
  }

  // Search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r => 
      r.reservedFor.toLowerCase().includes(query) ||
      r.phone.includes(query)
    )
  }

  // Date range filter
  if (dateRange.value) {
    const [start, end] = dateRange.value
    result = result.filter(r => {
      const date = new Date(r.startTime)
      return date >= start && date <= end
    })
  }

  return result
})

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'MMM dd, yyyy')
}

const formatTime = (dateStr: string) => {
  return format(new Date(dateStr), 'HH:mm')
}

// 添加状态标签类型方法
const getStatusTagType = (status: ReservationStatus): string => {
  const types: Record<ReservationStatus, string> = {
    [ReservationStatus.Upcoming]: 'warning',
    [ReservationStatus.Completed]: 'success',
    [ReservationStatus.Cancelled]: 'info'
  }
  return types[status] || 'info'
}

const handleStartParking = async (reservation: ReservationHistory) => {
  try {
    await ElMessageBox.confirm(
      `Start parking for reservation by ${reservation.reservedFor}?`,
      'Start Parking',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
    
    emit('start-parking', {
      spotId: props.spot.id,
      reservationId: reservation.startTime // 使用时间作为临时ID
    })
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to start parking')
    }
  }
}

const handleCancelReservation = async (reservation: ReservationHistory) => {
  try {
    await ElMessageBox.confirm(
      `Cancel reservation for ${reservation.reservedFor}?`,
      'Cancel Reservation',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Keep',
        type: 'warning'
      }
    )
    
    emit('cancel-reservation', reservation.startTime) // 使用时间作为临时ID
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to cancel reservation')
    }
  }
}

const handleViewDetails = (reservation: ReservationHistory) => {
  ElMessageBox.alert(
    `
    Reserved For: ${reservation.reservedFor}
    Contact: ${reservation.phone}
    Time: ${reservation.startTime} - ${reservation.endTime}
    Status: ${reservation.status}
    Notes: ${reservation.notes || 'N/A'}
    `,
    'Reservation Details',
    {
      confirmButtonText: 'OK'
    }
  )
}

const handleClose = () => {
  dialogVisible.value = false
}

const getEmptyDescription = () => {
  if (searchQuery.value || dateRange.value || statusFilter.value !== 'all') {
    return 'No reservations match your search criteria'
  }
  return props.spot.status === SpotStatus.Available 
    ? 'This spot has no upcoming reservations'
    : 'No reservation history found'
}

const formatMaxDuration = (minutes?: number): string => {
  if (!minutes) return '无限制';
  
  if (minutes < 60) {
    return `${minutes}分钟`;
  } else if (minutes < 1440) { // 24小时内
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}小时${remainingMinutes}分钟`
      : `${hours}小时`;
  } else { // 超过24小时
    const days = Math.floor(minutes / 1440);
    const remainingHours = Math.floor((minutes % 1440) / 60);
    return remainingHours > 0 
      ? `${days}天${remainingHours}小时`
      : `${days}天`;
  }
}
</script>

<style scoped lang="scss">
.reservation-history-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  .left {
    display: flex;
    gap: 12px;
    flex: 1;

    .search-input {
      width: 240px;
    }

    .date-range {
      .date-picker {
        width: 320px;
      }
    }
  }

  .status-tabs {
    :deep(.el-radio-button__inner) {
      padding: 8px 16px;
    }
  }
}

.reservation-list {
  .time-slot {
    display: flex;
    align-items: flex-start;
    gap: 8px;

    .el-icon {
      margin-top: 4px;
      color: #909399;
    }

    .time-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .date {
        font-weight: 500;
      }

      .time {
        font-size: 12px;
        color: #909399;
      }

      .max-duration {
        font-size: 12px;
        color: #67c23a;
        margin-top: 2px;
      }
    }
  }

  .customer-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .name {
      font-weight: 500;
    }

    .phone {
      font-size: 12px;
      color: #909399;
    }
  }

  .status-tag {
    min-width: 80px;
    text-transform: capitalize;
  }

  .notes {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #606266;

    .el-icon {
      color: #909399;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: center;

    .el-button {
      padding: 4px 8px;
      font-size: 13px;
    }
  }
}

:deep(.el-table) {
  --el-table-border-color: #e4e7ed;
  --el-table-header-bg-color: #f5f7fa;
  
  .el-table__header-wrapper {
    th {
      font-weight: 600;
      background-color: var(--el-table-header-bg-color);
    }
  }

  .el-table__row {
    td {
      padding: 12px 0;
    }
  }
}

.spot-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fdf6ec;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;

  .max-duration {
    color: #e6a23c;
    font-size: 14px;
  }
}
</style> 