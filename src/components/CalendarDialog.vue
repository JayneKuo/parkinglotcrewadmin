<template>
  <el-dialog
    title="Parking Calendar"
    v-model="visible"
    width="1200px"
    :close-on-click-modal="false"
    fullscreen
  >
    <div class="calendar-container">
      <!-- 顶部工具栏 -->
      <div class="calendar-header">
        <div class="left-tools">
          <!-- 快速日期选择 -->
          <el-radio-group v-model="quickDate" size="small" @change="handleQuickDateChange">
            <el-radio-button label="today">Today</el-radio-button>
          </el-radio-group>

          <!-- 日期选择器 -->
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="Select date"
            :disabled-date="disabledDate"
            @change="handleDateChange"
          />
        </div>
        
        <div class="right-tools">
          <!-- 时间范围选择 -->
          <el-select v-model="timeRange" size="small" style="width: 150px">
            <el-option label="00:00 - 12:00" value="morning" />
            <el-option label="12:00 - 24:00" value="afternoon" />
            <el-option label="Full Day" value="full" />
          </el-select>

          <!-- 时间刻度选择 -->
          <el-select v-model="timeInterval" size="small" style="width: 100px">
            <el-option label="30 min" value="30" />
            <el-option label="1 hour" value="60" />
            <el-option label="2 hours" value="120" />
          </el-select>
        </div>
      </div>

      <div class="main-content">
        <!-- 左侧区域树 -->
        <div class="area-tree">
          <el-input
            v-model="searchText"
            placeholder="Search locations..."
            prefix-icon="Search"
            clearable
          />
          
          <el-tree
            ref="treeRef"
            :data="parkingAreas"
            :props="defaultProps"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :default-checked-keys="defaultCheckedKeys"
            :filter-node-method="filterNode"
            @check="handleAreaCheck"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span>{{ node.label }}</span>
                <div class="space-info" v-if="data.type === 'space'">
                  <span class="space-status" :class="data.status.toLowerCase()">
                    {{ getSpaceStatusLabel(data.status) }}
                  </span>
                  <div class="space-services">
                    <el-tooltip 
                      v-for="service in data.services" 
                      :key="service"
                      :content="service"
                      placement="top"
                    >
                      <i :class="getServiceIcon(service)" class="service-icon"></i>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 右侧时间轴视图 -->
        <div class="timeline-view">
          <!-- 时间轴网格 -->
          <div class="timeline-grid">
            <!-- 时间轴标尺 -->
            <div class="time-header">
              <div class="corner-cell"></div>
              <div class="time-slots">
                <div 
                  v-for="slot in timeSlots" 
                  :key="slot.time"
                  class="time-slot"
                  :style="{ width: `${100/timeSlots.length}%` }"
                >
                  {{ slot.label }}
                </div>
              </div>
            </div>

            <!-- 车位和事件显示区域 -->
            <div class="grid-content">
              <!-- 车位列表 -->
              <div class="spaces-column">
                <div 
                  v-for="space in selectedSpaces" 
                  :key="space.id"
                  class="space-cell"
                >
                  <div class="space-info">
                    <span>{{ space.label }}</span>
                    <el-tag size="small" :type="getSpaceStatusType(space.status)">
                      {{ getSpaceStatusLabel(space.status) }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <!-- 时间格子和事件 -->
              <div class="time-grid">
                <div 
                  v-for="space in selectedSpaces" 
                  :key="space.id"
                  class="grid-row"
                >
                  <!-- 时间格子区域 -->
                  <div 
                    v-for="(slot, index) in timeSlots" 
                    :key="`${space.id}-${slot.time}`"
                    class="grid-cell"
                    :class="{
                      'grid-cell-selected': isSelectedCell(space.id, index),
                      'grid-cell-disabled': !isSlotAvailable(space, index)
                    }"
                    @mousedown="isSlotAvailable(space, index) && handleCellMouseDown(space, index)"
                    @mousemove="handleCellMouseMove(space, index)"
                    @mouseup="handleCellMouseUp(space, index)"
                  >
                    <div class="grid-cell-content"></div>
                  </div>

                  <!-- 已有的预定事件显示 -->
                  <div 
                    v-for="event in getSpaceEvents(space.id)"
                    :key="event.id"
                    class="event-block"
                    :class="event.type"
                    :style="getEventBlockStyle(event)"
                    @click="showEventDetails(event)"
                  >
                    <div class="event-content">
                      <span class="license-plate">{{ event.licensePlate }}</span>
                      <span class="time">{{ formatEventTime(event) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件详情弹窗 -->
    <el-dialog
      v-model="showDetails"
      title="Event Details"
      width="400px"
      append-to-body
    >
      <div v-if="selectedEvent" class="event-details">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="License Plate">
            {{ selectedEvent.licensePlate }}
          </el-descriptions-item>
          <el-descriptions-item label="Customer">
            {{ selectedEvent.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="Status">
            <el-tag :type="getEventType(selectedEvent)">
              {{ selectedEvent.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Start Time">
            {{ formatDateTime(selectedEvent.startTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="End Time">
            {{ formatDateTime(selectedEvent.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="Space">
            {{ selectedEvent.spaceNumber }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 添加预定弹窗 -->
    <el-dialog
      v-model="showReservationDialog"
      title="New Reservation"
      width="600px"
      append-to-body
    >
      <div class="reservation-form">
        <el-form :model="reservationForm" label-width="120px">
          <!-- 车位信息部分 -->
          <el-divider content-position="left">Space Information</el-divider>
          <el-form-item label="Space">
            <el-tag>{{ selectedSpaceInfo?.label }}</el-tag>
          </el-form-item>
          <el-form-item label="Space Type">
            <el-tag :style="selectedSpaceInfo?.style">
              {{ selectedSpaceInfo?.type || 'Standard' }}
              <span class="hourly-rate">${{ selectedSpaceInfo?.hourlyRate }}/hour</span>
            </el-tag>
          </el-form-item>
          <el-form-item label="Time Range">
            <div class="time-range-display">
              <span>{{ formatDateTime(reservationForm.startTime) }}</span>
              <el-divider direction="vertical" />
              <span>{{ formatDateTime(reservationForm.endTime) }}</span>
              <span class="duration">({{ calculateDuration }} hours)</span>
            </div>
          </el-form-item>

          <!-- 客户信息部分 -->
          <el-divider content-position="left">Customer Information</el-divider>
          <el-form-item label="Customer Name" prop="customerName" required>
            <el-input v-model="reservationForm.customerName" placeholder="Enter customer name" />
          </el-form-item>
          <el-form-item label="Phone Number" prop="phoneNumber" required>
            <el-input v-model="reservationForm.phoneNumber" placeholder="Enter phone number" />
          </el-form-item>

          <!-- 车辆信息部分 -->
          <el-divider content-position="left">Vehicle Information</el-divider>
          <el-form-item label="License Plate" prop="licensePlate" required>
            <el-input v-model="reservationForm.licensePlate" placeholder="Enter license plate" />
          </el-form-item>
          <el-form-item label="Brand" prop="vehicleBrand" required>
            <el-input v-model="reservationForm.vehicleBrand" placeholder="Enter vehicle brand" />
          </el-form-item>
          <el-form-item label="Model" prop="vehicleModel" required>
            <el-input v-model="reservationForm.vehicleModel" placeholder="Enter vehicle model" />
          </el-form-item>
          <el-form-item label="Color" prop="vehicleColor" required>
            <el-input v-model="reservationForm.vehicleColor" placeholder="Enter vehicle color" />
          </el-form-item>

          <!-- 服务选择部分 -->
          <el-divider content-position="left">Services</el-divider>
          <el-form-item required>
            <el-checkbox-group v-model="reservationForm.selectedServices">
              <div class="services-grid">
                <el-checkbox 
                  v-for="service in getSpaceServices(reservationForm.spaceId)"
                  :key="service.code"
                  :label="service.code"
                >
                  <div class="service-option">
                    <i :class="getServiceIcon(service.code)" class="service-icon"></i>
                    <div class="service-info">
                      <span>{{ service.name }}</span>
                      <span class="service-price">${{ service.price }}/hour</span>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </el-form-item>

          <!-- 费用明细 -->
          <el-divider content-position="left">Fee Details</el-divider>
          <div class="fee-details">
            <div class="fee-item">
              <span>Parking Fee:</span>
              <span>${{ calculateParkingFee }}</span>
            </div>
            <div v-for="service in selectedServiceDetails" :key="service.code" class="fee-item">
              <span>{{ service.name }}:</span>
              <span>${{ service.totalFee }}</span>
            </div>
            <div class="fee-item total">
              <span>Total Amount:</span>
              <span>${{ calculateTotalFee }}</span>
            </div>
          </div>

          <!-- 备注信息 -->
          <el-divider content-position="left">Additional Information</el-divider>
          <el-form-item label="Notes" prop="notes">
            <el-input type="textarea" v-model="reservationForm.notes" rows="3" placeholder="Enter additional notes" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showReservationDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleCreateReservation">Confirm</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ElMessage } from 'element-plus'

const visible = ref(false)
const currentDate = ref(new Date())
const showDetails = ref(false)
const selectedEvent = ref(null)
const timeScale = ref(12)
const startHour = ref(8) // 默认从早上8点开始
const searchText = ref('')
const treeRef = ref(null)

const quickDate = ref('today')
const selectedDate = ref(new Date())
const timeRange = ref('full')
const timeInterval = ref('60')

// 修改车位状态类型
const SPACE_STATUS = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Occupied',
  RESERVED: 'Reserved',
  LOCKED: 'Locked'
}

// 定义车位类型和价格
const SPACE_TYPES = {
  STANDARD: {
    code: 'STANDARD',
    name: 'Standard',
    baseRate: 2.00,
    style: {
      color: '#67C23A',
      backgroundColor: '#F0F9EB'
    }
  },
  VIP: {
    code: 'VIP',
    name: 'VIP',
    baseRate: 5.00,
    style: {
      color: '#E6A23C',
      backgroundColor: '#FDF6EC'
    }
  },
  ELECTRIC: {
    code: 'ELECTRIC',
    name: 'Electric',
    baseRate: 3.00,
    style: {
      color: '#409EFF',
      backgroundColor: '#ECF5FF'
    }
  },
  DISABLED: {
    code: 'DISABLED',
    name: 'Disabled',
    baseRate: 1.50,
    style: {
      color: '#909399',
      backgroundColor: '#F4F4F5'
    }
  }
}

// 定义服务类型和价格
const SERVICES = {
  PARKING: {
    code: 'PARKING',
    name: 'Standard Parking',
    price: 2.00,
    icon: 'el-icon-Parking'
  },
  CHARGING: {
    code: 'CHARGING',
    name: 'EV Charging',
    price: 5.00,
    icon: 'el-icon-Lightning'
  },
  VALET: {
    code: 'VALET',
    name: 'Valet Service',
    price: 10.00,
    icon: 'el-icon-Key'
  },
  WASHING: {
    code: 'WASHING',
    name: 'Car Washing',
    price: 30.00,
    icon: 'el-icon-WaterCup'
  },
  DETAILING: {
    code: 'DETAILING',
    name: 'Car Detailing',
    price: 50.00,
    icon: 'el-icon-Brush'
  },
  MAINTENANCE: {
    code: 'MAINTENANCE',
    name: 'Basic Maintenance',
    price: 40.00,
    icon: 'el-icon-Tools'
  }
}

// 获取车位状态显示标签
const getSpaceStatusLabel = (status) => {
  switch (status) {
    case SPACE_STATUS.AVAILABLE: return 'Available'
    case SPACE_STATUS.OCCUPIED: return 'Occupied'
    case SPACE_STATUS.RESERVED: return 'Reserved'
    case SPACE_STATUS.LOCKED: return 'Locked'
    default: return status
  }
}

// 修改获取状态样式类型的方法
const getSpaceStatusType = (status) => {
  switch (status) {
    case SPACE_STATUS.AVAILABLE: return 'success'
    case SPACE_STATUS.OCCUPIED: return 'danger'
    case SPACE_STATUS.RESERVED: return 'warning'
    case SPACE_STATUS.LOCKED: return 'info'
    default: return ''
  }
}

// 车场区域数据
const parkingAreas = ref([
  {
    id: 'lot-A',
    label: 'Parking Lot A',
    children: [
      {
        id: 'zone-A1',
        label: 'VIP Zone',
        children: [
          { 
            id: 'A1-01',
            label: 'A1-01',
            type: 'space',
            spaceType: SPACE_TYPES.VIP.code,
            status: SPACE_STATUS.AVAILABLE,
            hourlyRate: SPACE_TYPES.VIP.baseRate
          },
          { 
            id: 'A1-02',
            label: 'A1-02',
            type: 'space',
            spaceType: SPACE_TYPES.VIP.code,
            status: SPACE_STATUS.OCCUPIED,
            hourlyRate: SPACE_TYPES.VIP.baseRate
          }
        ]
      },
      {
        id: 'zone-A2',
        label: 'Electric Vehicle Zone',
        children: [
          { 
            id: 'A2-01',
            label: 'A2-01',
            type: 'space',
            spaceType: SPACE_TYPES.ELECTRIC.code,
            status: SPACE_STATUS.AVAILABLE,
            hourlyRate: SPACE_TYPES.ELECTRIC.baseRate
          },
          { 
            id: 'A2-02',
            label: 'A2-02',
            type: 'space',
            spaceType: SPACE_TYPES.ELECTRIC.code,
            status: SPACE_STATUS.RESERVED,
            hourlyRate: SPACE_TYPES.ELECTRIC.baseRate
          }
        ]
      }
    ]
  },
  {
    id: 'lot-B',
    label: 'Parking Lot B',
    children: [
      {
        id: 'zone-B1',
        label: 'Standard Zone',
        children: [
          { 
            id: 'B1-01',
            label: 'B1-01',
            type: 'space',
            spaceType: SPACE_TYPES.STANDARD.code,
            status: SPACE_STATUS.AVAILABLE,
            hourlyRate: SPACE_TYPES.STANDARD.baseRate
          },
          { 
            id: 'B1-02',
            label: 'B1-02',
            type: 'space',
            spaceType: SPACE_TYPES.STANDARD.code,
            status: SPACE_STATUS.LOCKED,
            hourlyRate: SPACE_TYPES.STANDARD.baseRate
          }
        ]
      },
      {
        id: 'zone-B2',
        label: 'Disabled Zone',
        children: [
          { 
            id: 'B2-01',
            label: 'B2-01',
            type: 'space',
            spaceType: SPACE_TYPES.DISABLED.code,
            status: SPACE_STATUS.AVAILABLE,
            hourlyRate: SPACE_TYPES.DISABLED.baseRate
          }
        ]
      }
    ]
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

// 选中的车位
const selectedSpaces = ref([])

// 事件数据
const events = ref([
  {
    id: '1',
    spaceId: 'A1-02',
    type: 'reservation',
    status: 'Active',
    licensePlate: 'CA 5678',
    customerName: 'John Smith',
    phoneNumber: '123-456-7890',
    vehicleBrand: 'BMW',
    vehicleModel: 'X5',
    vehicleColor: 'Black',
    startTime: '2024-03-20 09:00',
    endTime: '2024-03-20 12:00',
    services: ['PARKING', 'VALET', 'WASHING'],
    totalAmount: 95.00,
    notes: 'VIP customer'
  },
  {
    id: '2',
    spaceId: 'A2-02',
    type: 'reservation',
    status: 'Active',
    licensePlate: 'CA 9012',
    customerName: 'Alice Johnson',
    phoneNumber: '234-567-8901',
    vehicleBrand: 'Tesla',
    vehicleModel: 'Model 3',
    vehicleColor: 'White',
    startTime: '2024-03-20 13:00',
    endTime: '2024-03-20 17:00',
    services: ['PARKING', 'CHARGING'],
    totalAmount: 45.00,
    notes: 'Needs charging'
  }
])

// 搜索过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 监听搜索文本变化
watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

// 处理区域选择
const handleAreaCheck = (data, checked) => {
  if (data.type === 'space') {
    if (checked.checkedKeys.includes(data.id)) {
      selectedSpaces.value.push(data)
    } else {
      selectedSpaces.value = selectedSpaces.value.filter(space => space.id !== data.id)
    }
  }
}

// 获取车位事件
const getSpaceEvents = (spaceId) => {
  return events.value.filter(event => event.spaceId === spaceId)
}

// 计算事件块样式
const getEventBlockStyle = (event) => {
  const startHour = new Date(event.startTime).getHours()
  const endHour = new Date(event.endTime).getHours()
  const duration = endHour - startHour
  const startOffset = ((startHour - startHour.value) / timeScale.value) * 100
  const width = (duration / timeScale.value) * 100
  
  return {
    left: `${startOffset}%`,
    width: `${width}%`
  }
}

// 格式化当前日期显示
const formattedCurrentDate = computed(() => {
  return format(currentDate.value, 'yyyy-MM-dd')
})

// 日期导航方法
const previousDate = () => {
  currentDate.value = subDays(currentDate.value, 1)
}

const nextDate = () => {
  currentDate.value = addDays(currentDate.value, 1)
}

const today = () => {
  currentDate.value = new Date()
}

// 格式化小时显示
const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

// 格式化周显示
const formatWeek = (date) => {
  const start = startOfWeek(date)
  const end = endOfWeek(date)
  return `${format(start, 'MM/dd')} - ${format(end, 'MM/dd')}`
}

// 获取事件样式
const getEventStyle = (event) => {
  const startHour = new Date(event.startTime).getHours()
  const endHour = new Date(event.endTime).getHours()
  const duration = endHour - startHour
  
  return {
    top: `${startHour * 60}px`,
    height: `${duration * 60}px`
  }
}

// 获取指定日期的事件
const getEventsForDate = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd')
  return events.value.filter(event => event.startTime.startsWith(dateStr))
}

// 获取事件类型
const getEventType = (event) => {
  switch (event.status) {
    case 'Active': return 'primary'
    case 'Completed': return 'success'
    case 'Cancelled': return 'danger'
    default: return 'info'
  }
}

// 显示事件详情
const showEventDetails = (event) => {
  selectedEvent.value = event
  showDetails.value = true
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  return format(new Date(datetime), 'yyyy-MM-dd HH:mm')
}

// 计算时间槽
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`
    slots.push({
      time,
      label: time
    })
  }
  return slots
})

// 判断时间槽是否可用
const isSlotAvailable = (space, index) => {
  // 如果车位状态不是 Available，整个车位都不可用
  if (space.status !== SPACE_STATUS.AVAILABLE) {
    return false
  }

  // 检查该时间段是否有预定
  const slotTime = timeSlots.value[index].time
  const slotDate = new Date(selectedDate.value)
  const [hours, minutes] = slotTime.split(':').map(Number)
  slotDate.setHours(hours, minutes)

  // 检查是否与现有预定冲突
  return !events.value.some(event => {
    if (event.spaceId !== space.id) return false
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)
    return slotDate >= eventStart && slotDate < eventEnd
  })
}

// 处理快速日期选择
const handleQuickDateChange = (value) => {
  if (value === 'today') {
    selectedDate.value = new Date()
  }
}

// 处理日期选择
const handleDateChange = (date) => {
  selectedDate.value = date
  // 重新加载数据
  loadEvents()
}

// 检查是否是当前时间段
const isCurrentTimeSlot = (event) => {
  const now = new Date()
  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  
  return isWithinInterval(now, { start, end })
}

// 格式化事件时间
const formatEventTime = (event) => {
  return `${format(new Date(event.startTime), 'HH:mm')} - ${format(new Date(event.endTime), 'HH:mm')}`
}

// 暴露方法给父组件
defineExpose({
  show: () => {
    visible.value = true
  }
})

const isDragging = ref(false)
const dragStartTime = ref(null)
const dragEndTime = ref(null)
const selectedSpace = ref(null)
const showReservationDialog = ref(false)
const reservationForm = ref({
  startTime: null,
  endTime: null,
  spaceId: '',
  // 客户信息
  customerName: '',
  phoneNumber: '',
  // 车辆信息
  licensePlate: '',
  vehicleBrand: '',
  vehicleModel: '',
  vehicleColor: '',
  // 服务信息
  selectedServices: [],
  notes: ''
})

// 修改拖拽相关的状态和方法
const handleCellDragStart = (e, space) => {
  // 检查车位是否可用
  if (space.status !== SPACE_STATUS.AVAILABLE) {
    ElMessage.warning('This space is not available for reservation')
    return
  }
  
  isDragging.value = true
  selectedSpace.value = space
  
  const gridRect = e.currentTarget.getBoundingClientRect()
  const relativeX = e.clientX - gridRect.left
  dragStartTime.value = convertPositionToTime(relativeX, gridRect.width)
  dragEndTime.value = dragStartTime.value
  
  // 阻止文本选择
  e.preventDefault()
}

const handleCellDragMove = (e) => {
  if (!isDragging.value) return
  
  const gridRect = e.currentTarget.getBoundingClientRect()
  const relativeX = e.clientX - gridRect.left
  dragEndTime.value = convertPositionToTime(relativeX, gridRect.width)
}

const handleCellDragEnd = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  
  // 检查是否有有效的时间范围
  if (dragStartTime.value && dragEndTime.value) {
    const startTime = new Date(selectedDate.value)
    const endTime = new Date(selectedDate.value)
    
    const startMinutes = Math.min(dragStartTime.value, dragEndTime.value)
    const endMinutes = Math.max(dragStartTime.value, dragEndTime.value)
    
    startTime.setHours(Math.floor(startMinutes / 60))
    startTime.setMinutes(startMinutes % 60)
    
    endTime.setHours(Math.floor(endMinutes / 60))
    endTime.setMinutes(endMinutes % 60)
    
    // 检查是否与现有预定冲突
    const hasConflict = checkTimeConflict(startTime, endTime, selectedSpace.value.id)
    if (hasConflict) {
      ElMessage.warning('Selected time slot conflicts with existing reservation')
      return
    }
    
    // 打开预定表单
    reservationForm.value = {
      startTime,
      endTime,
      spaceId: selectedSpace.value.id,
      licensePlate: '',
      customerName: '',
      phoneNumber: '',
      carType: '',
      selectedServices: [],
      notes: ''
    }
    showReservationDialog.value = true
  }
  
  // 重置拖拽状态
  dragStartTime.value = null
  dragEndTime.value = null
  selectedSpace.value = null
}

// 添加位置转换为时间的辅助函数
const convertPositionToTime = (position, totalWidth) => {
  const percent = Math.max(0, Math.min(1, position / totalWidth))
  return Math.round(percent * 24 * 60) // 转换为分钟数
}

// 修改拖拽选择样式计算
const dragSelectionStyle = computed(() => {
  if (!isDragging.value || dragStartTime.value === null || dragEndTime.value === null) return {}
  
  const startPercent = (dragStartTime.value / (24 * 60)) * 100
  const endPercent = (dragEndTime.value / (24 * 60)) * 100
  
  const left = Math.min(startPercent, endPercent)
  const width = Math.abs(endPercent - startPercent)
  
  return {
    left: `${left}%`,
    width: `${width}%`,
    top: '0',
    height: '100%'
  }
})

// 创建预定
const handleCreateReservation = () => {
  // 表单验证
  const required = [
    'customerName',
    'phoneNumber',
    'licensePlate',
    'vehicleBrand',
    'vehicleModel',
    'vehicleColor'
  ]
  
  const missing = required.filter(field => !reservationForm.value[field])
  if (missing.length > 0 || !reservationForm.value.selectedServices.length) {
    ElMessage.warning('Please fill in all required information')
    return
  }
  
  // 创建新预定
  const newEvent = {
    id: Date.now().toString(),
    spaceId: selectedSpace.value.id,
    // 客户信息
    customerName: reservationForm.value.customerName,
    phoneNumber: reservationForm.value.phoneNumber,
    // 车辆信息
    licensePlate: reservationForm.value.licensePlate,
    vehicleBrand: reservationForm.value.vehicleBrand,
    vehicleModel: reservationForm.value.vehicleModel,
    vehicleColor: reservationForm.value.vehicleColor,
    // 服务信息
    services: reservationForm.value.selectedServices,
    startTime: reservationForm.value.startTime,
    endTime: reservationForm.value.endTime,
    notes: reservationForm.value.notes,
    type: 'reservation',
    status: 'Active'
  }
  
  events.value.push(newEvent)
  showReservationDialog.value = false
  ElMessage.success('Reservation created successfully')
}

// 默认选中的节点keys
const defaultCheckedKeys = ref([])

// 在组件挂载时初始化选中状态
onMounted(() => {
  // 收集所有车位ID
  const collectSpaceIds = (nodes) => {
    let ids = []
    nodes.forEach(node => {
      if (node.type === 'space') {
        ids.push(node.id)
      }
      if (node.children) {
        ids = ids.concat(collectSpaceIds(node.children))
      }
    })
    return ids
  }
  
  // 设置默认选中的keys
  defaultCheckedKeys.value = collectSpaceIds(parkingAreas.value)
  
  // 更新选中的车位
  selectedSpaces.value = defaultCheckedKeys.value.map(id => {
    return findSpaceById(parkingAreas.value, id)
  }).filter(Boolean)
})

// 添加查找车位的辅助函数
const findSpaceById = (nodes, id) => {
  for (const node of nodes) {
    if (node.type === 'space' && node.id === id) {
      return node
    }
    if (node.children) {
      const found = findSpaceById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 添加选择相关的状态
const isSelecting = ref(false)
const selectionStart = ref(null)
const selectionEnd = ref(null)
const selectedSpaceId = ref(null)

// 修改处理格子点击事件
const handleCellMouseDown = (space, index) => {
  // 如果时间槽不可用，直接返回
  if (!isSlotAvailable(space, index)) {
    return
  }
  
  isSelecting.value = true
  selectedSpaceId.value = space.id
  selectionStart.value = index
  selectionEnd.value = index
}

const handleCellMouseMove = (space, index) => {
  if (!isSelecting.value || space.id !== selectedSpaceId.value) return
  
  // 检查拖动范围内是否有不可用时间段
  const start = Math.min(selectionStart.value, index)
  const end = Math.max(selectionStart.value, index)
  
  for (let i = start; i <= end; i++) {
    if (!isSlotAvailable(space, i)) {
      return // 如果有不可用时间段，不更新选择范围
    }
  }
  
  selectionEnd.value = index
}

const handleCellMouseUp = (space, index) => {
  if (!isSelecting.value || space.id !== selectedSpaceId.value) return
  
  isSelecting.value = false
  
  // 计算选中的时间范围
  const startIndex = Math.min(selectionStart.value, selectionEnd.value)
  const endIndex = Math.max(selectionStart.value, selectionEnd.value)
  
  // 检查整个选择范围是否可用
  for (let i = startIndex; i <= endIndex; i++) {
    if (!isSlotAvailable(space, i)) {
      ElMessage.warning('Selected time range includes unavailable slots')
      return
    }
  }
  
  const startTime = new Date(selectedDate.value)
  const endTime = new Date(selectedDate.value)
  
  const startSlot = timeSlots.value[startIndex]
  const endSlot = timeSlots.value[endIndex]
  
  const [startHour, startMinute] = startSlot.time.split(':').map(Number)
  const [endHour, endMinute] = endSlot.time.split(':').map(Number)
  
  startTime.setHours(startHour, startMinute)
  endTime.setHours(endHour, endMinute)
  
  // 打开预定表单
  reservationForm.value = {
    startTime,
    endTime,
    spaceId: space.id,
    licensePlate: '',
    customerName: '',
    phoneNumber: '',
    carType: '',
    selectedServices: [],
    notes: ''
  }
  showReservationDialog.value = true
  
  // 重置选择状态
  selectionStart.value = null
  selectionEnd.value = null
  selectedSpaceId.value = null
}

// 判断格子是否被选中
const isSelectedCell = (spaceId, index) => {
  if (!isSelecting.value || spaceId !== selectedSpaceId.value) return false
  
  const start = Math.min(selectionStart.value, selectionEnd.value)
  const end = Math.max(selectionStart.value, selectionEnd.value)
  
  return index >= start && index <= end
}

// 检查时间冲突
const checkTimeConflict = (startTime, endTime, spaceId) => {
  return events.value.some(event => {
    if (event.spaceId !== spaceId) return false
    
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)
    
    return startTime < eventEnd && endTime > eventStart
  })
}

// 添加获取服务图标的方法
const getServiceIcon = (serviceCode) => {
  const icons = {
    'PARKING': 'el-icon-Parking',
    'CHARGING': 'el-icon-Lightning',
    'VALET': 'el-icon-Key',
    'WASHING': 'el-icon-WaterCup',
    'DETAILING': 'el-icon-Brush'
  }
  return icons[serviceCode] || 'el-icon-More'
}

// 获取车位支持的服务
const getSpaceServices = (spaceId) => {
  const space = findSpaceById(parkingAreas.value, spaceId)
  if (!space) return []

  // 基础服务 - 所有车位都有
  const baseServices = [SERVICES.PARKING]

  // 根据车位类型添加额外服务
  const extraServices = []
  
  switch (space.spaceType) {
    case SPACE_TYPES.VIP.code:
      extraServices.push(
        SERVICES.VALET,
        SERVICES.WASHING,
        SERVICES.DETAILING,
        SERVICES.MAINTENANCE
      )
      break
    case SPACE_TYPES.ELECTRIC.code:
      extraServices.push(SERVICES.CHARGING)
      break
    case SPACE_TYPES.STANDARD.code:
      extraServices.push(SERVICES.WASHING)
      break
  }

  return [...baseServices, ...extraServices]
}

// 添加车辆品牌列表
const vehicleBrands = [
  { label: 'Toyota', value: 'toyota' },
  { label: 'Honda', value: 'honda' },
  { label: 'BMW', value: 'bmw' },
  { label: 'Mercedes-Benz', value: 'mercedes' },
  { label: 'Audi', value: 'audi' },
  { label: 'Volkswagen', value: 'volkswagen' },
  { label: 'Ford', value: 'ford' },
  { label: 'Chevrolet', value: 'chevrolet' },
  { label: 'Tesla', value: 'tesla' },
  { label: 'Other', value: 'other' }
]

// 获取车位类型标签样式
const getSpaceTypeTagType = (type) => {
  switch (type) {
    case 'Standard': return ''
    case 'Premium': return 'success'
    case 'VIP': return 'warning'
    case 'Disabled': return 'info'
    case 'Electric': return 'primary'
    default: return ''
  }
}

// 计算时长（小时）
const calculateDuration = computed(() => {
  if (!reservationForm.value.startTime || !reservationForm.value.endTime) return 0
  const start = new Date(reservationForm.value.startTime)
  const end = new Date(reservationForm.value.endTime)
  return Math.ceil((end - start) / (1000 * 60 * 60))
})

// 计算停车费
const calculateParkingFee = computed(() => {
  if (!selectedSpace.value) return '0.00'
  
  const hours = calculateDuration.value
  const baseRate = selectedSpace.value.hourlyRate || 2.00 // 默认费率
  return (hours * baseRate).toFixed(2)
})

// 获取选中的服务详情
const selectedServiceDetails = computed(() => {
  const hours = calculateDuration.value
  return reservationForm.value.selectedServices.map(code => {
    const service = SERVICES[code]
    return {
      code: service.code,
      name: service.name,
      price: service.price,
      totalFee: (service.price * hours).toFixed(2)
    }
  })
})

// 计算总费用
const calculateTotalFee = computed(() => {
  const parkingFee = parseFloat(calculateParkingFee.value)
  const serviceFees = selectedServiceDetails.value.reduce((total, service) => {
    return total + parseFloat(service.totalFee)
  }, 0)
  return (parkingFee + serviceFees).toFixed(2)
})

// 添加车位类型标签样式
const getSpaceTypeStyle = (type) => {
  const styles = {
    'VIP': {
      color: '#E6A23C',
      backgroundColor: '#FDF6EC'
    },
    'Electric': {
      color: '#409EFF',
      backgroundColor: '#ECF5FF'
    },
    'Standard': {
      color: '#67C23A',
      backgroundColor: '#F0F9EB'
    }
  }
  return styles[type] || styles.Standard
}

// 在预定表单中显示车位类型和费率
const selectedSpaceInfo = computed(() => {
  if (!selectedSpace.value) return null
  
  return {
    label: selectedSpace.value.label,
    type: selectedSpace.value.spaceType,
    hourlyRate: selectedSpace.value.hourlyRate,
    style: getSpaceTypeStyle(selectedSpace.value.spaceType)
  }
})
</script>

<style scoped>
.calendar-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
}

.left-tools,
.right-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.area-tree {
  width: 300px;
  padding: 16px;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.space-status {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.space-status.available {
  background-color: #f0f9eb;
  color: #67c23a;
}

.space-status.occupied {
  background-color: #fef0f0;
  color: #f56c6c;
}

.space-status.reserved {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.space-status.locked {
  background-color: #909399;
  color: #ffffff;
}

.timeline-view {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.time-ruler {
  display: flex;
  border-bottom: 1px solid #dcdfe6;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.space-column {
  width: 100px;
  padding: 8px;
  font-weight: bold;
  border-right: 1px solid #dcdfe6;
}

.time-slots {
  flex: 1;
  display: flex;
}

.time-slot {
  padding: 8px;
  text-align: center;
  border-right: 1px solid #ebeef5;
}

.spaces-timeline {
  flex: 1;
}

.space-row {
  display: flex;
  height: 60px;
  border-bottom: 1px solid #ebeef5;
}

.space-info {
  width: 100px;
  padding: 8px;
  border-right: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
}

.time-blocks {
  flex: 1;
  position: relative;
}

.event-block {
  position: absolute;
  height: 80%;
  top: 10%;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 100px;
}

.event-block.reservation {
  background-color: #fdf6ec;
  border: 1px solid #e6a23c;
  color: #e6a23c;
}

.event-block.parking {
  background-color: #fef0f0;
  border: 1px solid #f56c6c;
  color: #f56c6c;
}

.current-date {
  font-size: 16px;
  font-weight: bold;
  min-width: 120px;
  text-align: center;
}

.event-details {
  padding: 20px;
}

.timeline-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.time-header {
  display: flex;
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
}

.corner-cell {
  width: 150px;
  min-width: 150px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
}

.time-slots {
  flex: 1;
  display: flex;
}

.time-slot {
  padding: 8px;
  text-align: center;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #dcdfe6;
  font-size: 12px;
}

.grid-content {
  display: flex;
  flex: 1;
}

.spaces-column {
  width: 150px;
  min-width: 150px;
  border-right: 1px solid #dcdfe6;
}

.space-cell {
  height: 60px;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.space-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-grid {
  flex: 1;
  position: relative;
}

.grid-row {
  display: flex;
  height: 60px;
  position: relative;
  cursor: pointer;
}

.grid-cell {
  flex: 1;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.grid-cell-disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.grid-cell:not(.grid-cell-disabled):hover {
  background-color: rgba(64, 158, 255, 0.1);
}

.grid-cell-selected:not(.grid-cell-disabled) {
  background-color: rgba(64, 158, 255, 0.2);
}

.grid-cell-content {
  height: 100%;
  width: 100%;
}

.event-block {
  position: absolute;
  height: 80%;
  top: 10%;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  z-index: 1;
  background-color: #ecf5ff;
  border: 1px solid #409eff;
  color: #409eff;
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.license-plate {
  font-weight: bold;
  font-size: 14px;
}

.customer-info {
  font-size: 12px;
  color: #666;
}

.time {
  font-size: 11px;
  opacity: 0.8;
}

.is-current {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.drag-selection {
  position: absolute;
  background-color: rgba(64, 158, 255, 0.2);
  border: 1px solid #409eff;
  pointer-events: none;
  z-index: 1;
}

.time-grid {
  user-select: none;
}

.reservation-form {
  padding: 20px;
}

.space-services {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.service-icon {
  font-size: 16px;
  color: #409eff;
}

.event-block .services {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
}

/* 修改事件块样式，显示服务图标 */
.event-block .event-content {
  display: flex;
  flex-direction: column;
}

.event-block .service-icons {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.event-block .service-icon {
  font-size: 12px;
  opacity: 0.8;
}

/* 添加不同状态的车位样式 */
.grid-row[data-status="locked"] .grid-cell {
  background-color: #f5f7fa;
  cursor: not-allowed;
}

.grid-row[data-status="occupied"] .grid-cell {
  background-color: #fef0f0;
  cursor: not-allowed;
}

.grid-row[data-status="reserved"] .grid-cell {
  background-color: #fdf6ec;
  cursor: not-allowed;
}

.time-range-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.service-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-icon {
  font-size: 18px;
}

.el-divider {
  margin: 16px 0;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.fee-details {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.fee-item.total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dcdfe6;
  font-weight: bold;
  font-size: 16px;
}

.service-info {
  display: flex;
  flex-direction: column;
}

.service-price {
  font-size: 12px;
  color: #909399;
}

.duration {
  color: #909399;
  margin-left: 8px;
}

.hourly-rate {
  margin-left: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.space-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style> 