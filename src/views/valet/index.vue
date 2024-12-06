<template>
  <div class="valet-container">
    <!-- Search Form -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Keyword">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="Order No./Name/Phone/Plate" 
            clearable 
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select 
            v-model="searchForm.status" 
            placeholder="Select status"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Date Range">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Order List -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>Valet Orders</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>New Order
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>Export
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="orderList" 
        border 
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="Order No." width="160" fixed />
        <el-table-column prop="customerName" label="Customer" width="120" />
        <el-table-column prop="phone" label="Phone" width="120" />
        <el-table-column label="Car Info" width="200">
          <template #default="{ row }">
            <div class="car-info">
              <el-tag>{{ row.plateNo }}</el-tag>
              <span class="car-model">{{ row.carModel }}</span>
              <span class="car-color">({{ row.carColor }})</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="parkingLot" label="Parking Lot" min-width="150" show-overflow-tooltip />
        <el-table-column prop="spaceNo" label="Space Location" width="180">
          <template #default="{ row }">
            <div class="space-location">
              <template v-if="row.zoneName">
                <el-tag type="info">
                  Zone {{ row.zoneName }}
                </el-tag>
              </template>
              <template v-if="row.spaceNo">
                <el-tag type="success" class="ml-2">
                  Space {{ row.spaceNo }}
                </el-tag>
              </template>
              <template v-if="!row.spaceNo">
                <span class="text-gray">Not Assigned</span>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="Source" width="120">
          <template #default="{ row }">
            <el-tag :type="getSourceType(row.source)" size="small">
              {{ formatSource(row.source) }}
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
                  <!-- Reserved -->
                  <template v-if="row.status === ValetStatus.Reserved">
                    <el-dropdown-item @click="handleCheckIn(row)">
                      <el-icon><Van /></el-icon>Check In
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleCancel(row)">
                      <el-icon><Close /></el-icon>Cancel
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- CheckedIn -->
                  <template v-if="row.status === ValetStatus.CheckedIn">
                    <el-dropdown-item @click="handleMarkPending(row)">
                      <el-icon><Van /></el-icon>Mark as Pending
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Pending -->
                  <template v-if="row.status === ValetStatus.Pending">
                    <el-dropdown-item @click="handleVehicleInfo(row)">
                      <el-icon><Camera /></el-icon>Update Vehicle Info
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleAssignDriver(row)">
                      <el-icon><User /></el-icon>Reassign Driver
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleParked(row)">
                      <el-icon><Location /></el-icon>Mark as Parked
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Parked -->
                  <template v-if="row.status === ValetStatus.Parked">
                    <el-dropdown-item @click="handleRequestPickup(row)">
                      <el-icon><Timer /></el-icon>Request Pickup
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Requested -->
                  <template v-if="row.status === ValetStatus.Requested">
                    <el-dropdown-item @click="handleStartPickup(row)">
                      <el-icon><Van /></el-icon>Start Pickup
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- OnTheWay -->
                  <template v-if="row.status === ValetStatus.OnTheWay">
                    <el-dropdown-item @click="handleReady(row)">
                      <el-icon><Check /></el-icon>Mark as Ready
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Ready -->
                  <template v-if="row.status === ValetStatus.Ready">
                    <el-dropdown-item @click="handlePayment(row)">
                      <el-icon><Money /></el-icon>Process Payment
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Paid -->
                  <template v-if="row.status === ValetStatus.Paid">
                    <el-dropdown-item @click="handleComplete(row)">
                      <el-icon><Check /></el-icon>Complete
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>

                  <!-- Closed -->
                  <template v-if="row.status === ValetStatus.Closed">
                    <el-dropdown-item @click="handleView(row)">
                      <el-icon><View /></el-icon>View Details
                    </el-dropdown-item>
                  </template>
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
        />
      </div>
    </el-card>

    <!-- Assign Driver Dialog -->
    <AssignDriverDialog
      v-model="assignDriverVisible"
      :order="currentOrder"
      :available-drivers="availableDrivers"
      @confirm="handleAssignConfirm"
    />

    <!-- Payment Dialog -->
    <PaymentDialog
      v-model="paymentVisible"
      :order="currentOrder"
      @confirm="handlePaymentConfirm"
    />

    <!-- Export Confirm Dialog -->
    <el-dialog
      v-model="exportDialogVisible"
      title="Export Orders"
      width="500px"
    >
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="Date Range">
          <el-date-picker
            v-model="exportForm.dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 320px"
          />
        </el-form-item>
        <el-form-item label="Status">
          <el-select 
            v-model="exportForm.status" 
            placeholder="All Status"
            clearable
            multiple
            collapse-tags
            style="width: 320px"
          >
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            >
              <el-tag :type="getStatusType(status.value)" size="small">
                {{ status.label }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Format">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleExportConfirm">
            Export
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Parking Space Dialog -->
    <ParkingSpaceDialog
      v-model="parkingSpaceVisible"
      :order="currentOrder"
      @confirm="handleParkingSpaceConfirm"
    />

    <!-- Create Valet Dialog -->
    <CreateValetDialog
      v-model="createDialogVisible"
      @created="handleValetCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown, Van, Close, User, Location, Timer, Check, Money, View, Download, Camera, Star, Search, Tickets } from '@element-plus/icons-vue'
import type { ValetOrder, ValetDriver } from '@/types/valet'
import { ValetStatus, ValetSource } from '@/types/valet'
import AssignDriverDialog from '@/components/valet/AssignDriverDialog.vue'
import PaymentDialog from '@/components/valet/PaymentDialog.vue'
import ParkingSpaceDialog from '@/components/valet/ParkingSpaceDialog.vue'
import CreateValetDialog from '@/components/valet/CreateValetDialog.vue'
import { mockValetOrders } from '@/types/valet'

const router = useRouter()

// Search form
const searchForm = ref({
  keyword: '',
  status: '',
  dateRange: null as [Date, Date] | null
})

// Status options
const statusOptions = [
  { label: 'Reserved', value: ValetStatus.Reserved },
  { label: 'Checked In', value: ValetStatus.CheckedIn },
  { label: 'Pending', value: ValetStatus.Pending },
  { label: 'Parked', value: ValetStatus.Parked },
  { label: 'Requested', value: ValetStatus.Requested },
  { label: 'On The Way', value: ValetStatus.OnTheWay },
  { label: 'Ready', value: ValetStatus.Ready },
  { label: 'Paid', value: ValetStatus.Paid },
  { label: 'Closed', value: ValetStatus.Closed }
]

// Mock data
const orderList = ref<ValetOrder[]>(Object.values(mockValetOrders))

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

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

// 添加选中的泊车员状态
const selectedDriver = ref('')

// 添加搜索相关的状态
const driverSearchKeyword = ref('')
const filteredDrivers = computed(() => {
  const keyword = driverSearchKeyword.value.toLowerCase()
  return availableDrivers.value.filter(driver => 
    !keyword || 
    driver.name.toLowerCase().includes(keyword) || 
    driver.phone.includes(keyword)
  )
})

// Utility functions
const getStatusType = (status: ValetStatus): string => {
  const types: Record<ValetStatus, string> = {
    [ValetStatus.Reserved]: 'info',
    [ValetStatus.CheckedIn]: 'warning',
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

const formatStatus = (status: ValetStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Event handlers
const handleSearch = async () => {
  loading.value = true
  try {
    console.log('Search form:', searchForm.value)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    dateRange: null
  }
}

const handleAdd = () => {
  createDialogVisible.value = true
}

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

    // 更新订状态
    order.status = ValetStatus.CheckedIn
    order.checkedInAt = new Date().toISOString()
    
    // 更新列表数据
    const index = orderList.value.findIndex(o => o.id === order.id)
    if (index !== -1) {
      orderList.value[index] = { ...order }
    }
    ElMessage.success('Check-in completed')

  } catch (error) {
    console.error('Check-in failed:', error)
    ElMessage.error('Failed to complete check-in')
  }
}

const handleVehicleInfo = async (order: ValetOrder) => {
  try {
    await ElMessageBox.confirm(
      h('div', { class: 'vehicle-photo-dialog' }, [
        h('p', 'Please take photos of the vehicle:'),
        h('div', { class: 'photo-grid' }, [
          // 前视图
          h('div', { class: 'photo-item' }, [
            h('h4', 'Front View'),
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
                  h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                  h('div', { class: 'upload-text' }, 'Front View')
                ]
              })
            ])
          ]),
          // 后视图
          h('div', { class: 'photo-item' }, [
            h('h4', 'Rear View'),
            h('el-upload', {
              action: '#',
              listType: 'picture-card',
              autoUpload: false,
              limit: 1,
              onChange: (file: any) => {
                if (!order.photos) order.photos = {}
                order.photos['rear'] = URL.createObjectURL(file.raw)
              }
            }, {
              default: () => [
                h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                h('div', { class: 'upload-text' }, 'Rear View')
              ]
            })
          ]),
          // 左侧视图
          h('div', { class: 'photo-item' }, [
            h('h4', 'Left Side'),
            h('el-upload', {
              action: '#',
              listType: 'picture-card',
              autoUpload: false,
              limit: 1,
              onChange: (file: any) => {
                if (!order.photos) order.photos = {}
                order.photos['left'] = URL.createObjectURL(file.raw)
              }
            }, {
              default: () => [
                h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                h('div', { class: 'upload-text' }, 'Left Side')
              ]
            })
          ]),
          // 右侧视图
          h('div', { class: 'photo-item' }, [
            h('h4', 'Right Side'),
            h('el-upload', {
              action: '#',
              listType: 'picture-card',
              autoUpload: false,
              limit: 1,
              onChange: (file: any) => {
                if (!order.photos) order.photos = {}
                order.photos['right'] = URL.createObjectURL(file.raw)
              }
            }, {
              default: () => [
                h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                h('div', { class: 'upload-text' }, 'Right Side')
              ]
            })
          ]),
          // 车牌照片
          h('div', { class: 'photo-item license' }, [
            h('h4', 'License Plate'),
            h('el-upload', {
              action: '#',
              listType: 'picture-card',
              autoUpload: false,
              limit: 1,
              onChange: (file: any) => {
                if (!order.photos) order.photos = {}
                order.photos['license'] = URL.createObjectURL(file.raw)
              }
            }, {
              default: () => [
                h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                h('div', { class: 'upload-text' }, 'License Plate')
              ]
            })
          ]),
          // 损坏情况
          h('div', { class: 'photo-item damage' }, [
            h('h4', 'Damage (if any)'),
            h('el-upload', {
              action: '#',
              listType: 'picture-card',
              autoUpload: false,
              limit: 1,
              onChange: (file: any) => {
                if (!order.photos) order.photos = {}
                order.photos['damage'] = URL.createObjectURL(file.raw)
              }
            }, {
              default: () => [
                h('el-icon', { class: 'upload-icon' }, [h(Plus)]),
                h('div', { class: 'upload-text' }, 'Damage Photo')
              ]
            })
          ])
        ])
      ]),
      {
        title: 'Vehicle Photos',
        confirmButtonText: 'Complete',
        cancelButtonText: 'Cancel',
        customClass: 'vehicle-photo-dialog'
      }
    )

    // 更新列表数据
    const index = orderList.value.findIndex(o => o.id === order.id)
    if (index !== -1) {
      orderList.value[index] = { ...order }
    }
    ElMessage.success('Vehicle information updated')

  } catch (error) {
    console.error('Failed to update vehicle info:', error)
    ElMessage.error('Failed to update vehicle information')
  }
}

const handleAssignDriver = (order: ValetOrder) => {
  currentOrder.value = order
  assignDriverVisible.value = true
}

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
    
    // 4. 更新列表数据
    const index = orderList.value.findIndex(o => o.id === currentOrder.value.id)
    if (index !== -1) {
      orderList.value[index] = { ...currentOrder.value }
    }
    
    assignDriverVisible.value = false
    ElMessage.success('Driver assigned and order marked as pending')
  } catch (error) {
    console.error('Failed to assign driver:', error)
    ElMessage.error('Failed to assign driver')
  }
}

const handleParked = async (order: ValetOrder) => {
  try {
    currentOrder.value = order
    parkingSpaceVisible.value = true
  } catch (error) {
    console.error('Failed to mark as parked:', error)
    ElMessage.error('Failed to complete parking')
  }
}

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
    
    // 更新列表数据
    const index = orderList.value.findIndex(o => o.id === currentOrder.value?.id)
    if (index !== -1) {
      orderList.value[index] = { ...currentOrder.value }
    }
    
    parkingSpaceVisible.value = false
    ElMessage.success('Vehicle parked successfully')
  } catch (error) {
    console.error('Failed to mark as parked:', error)
    ElMessage.error('Failed to complete parking')
  }
}

const handleRequestPickup = async (order: ValetOrder) => {
  try {
    // 1. 显示确认对话框
    const { action } = await ElMessageBox({
      title: 'Request Pickup',
      message: h('div', { class: 'pickup-dialog' }, [
        // 订单信息
        h('div', { class: 'order-summary' }, [
          h('div', { class: 'summary-item' }, [
            h('span', { class: 'label' }, 'Order No:'),
            h('span', { class: 'value' }, order.orderNo)
          ]),
          h('div', { class: 'summary-item' }, [
            h('span', { class: 'label' }, 'Customer:'),
            h('span', { class: 'value' }, order.customerName)
          ]),
          h('div', { class: 'summary-item' }, [
            h('span', { class: 'label' }, 'Location:'),
            h('span', { class: 'value' }, `Zone ${order.zoneName} - Space ${order.spaceNo}`)
          ])
        ]),

        // 付款状态提醒
        h('div', { class: 'payment-status' }, [
          order.paymentStatus === 'unpaid' 
            ? h('el-alert', {
                title: 'Payment Required',
                type: 'warning',
                description: 'Please remind the customer that payment is required before vehicle release.',
                showIcon: true,
                class: 'payment-alert'
              })
            : h('el-alert', {
                title: 'Payment Completed',
                type: 'success',
                description: 'Vehicle can be released after retrieval.',
                showIcon: true,
                class: 'payment-alert'
              })
        ])
      ]),
      confirmButtonText: 'Confirm Pickup',
      cancelButtonText: 'Cancel',
      customClass: 'pickup-dialog'
    })

    if (action === 'confirm') {
      // 2. 更新订单状态
      order.status = ValetStatus.Requested
      order.requestedAt = new Date().toISOString()
      
      // 3. 更新列表数据
      const index = orderList.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        orderList.value[index] = { ...order }
      }
      
      ElMessage.success('Pickup request processed')
    }

  } catch (error) {
    if (error === 'cancel') return
    console.error('Failed to request pickup:', error)
    ElMessage.error('Failed to process pickup request')
  }
}

const handleStartPickup = (order: ValetOrder) => {
  order.status = ValetStatus.OnTheWay
  // 更新列表数据
  const index = orderList.value.findIndex(o => o.id === order.id)
  if (index !== -1) {
    orderList.value[index] = { ...order }
  }
  ElMessage.success('Started pickup process')
}

const handleReady = (order: ValetOrder) => {
  order.status = ValetStatus.Ready
  order.readyAt = new Date().toISOString()
  // 更新列表数据
  const index = orderList.value.findIndex(o => o.id === order.id)
  if (index !== -1) {
    orderList.value[index] = { ...order }
  }
  ElMessage.success('Vehicle ready for pickup')
}

const handlePayment = (order: ValetOrder) => {
  currentOrder.value = order
  paymentVisible.value = true
}

const handlePaymentConfirm = (data: any) => {
  if (!currentOrder.value) return
  
  currentOrder.value.paymentStatus = 'paid'
  currentOrder.value.paidAt = new Date().toISOString()
  currentOrder.value.paymentMethod = data.method
  currentOrder.value.transactionId = `TXN${Date.now()}`
  currentOrder.value.status = ValetStatus.Paid
  
  // 更新列表数据
  const index = orderList.value.findIndex(o => o.id === currentOrder.value.id)
  if (index !== -1) {
    orderList.value[index] = { ...currentOrder.value }
  }
  
  paymentVisible.value = false
  ElMessage.success('Payment processed successfully')
}

const handleComplete = (order: ValetOrder) => {
  order.status = ValetStatus.Closed
  order.closedAt = new Date().toISOString()
  // 更新列表数据
  const index = orderList.value.findIndex(o => o.id === order.id)
  if (index !== -1) {
    orderList.value[index] = { ...order }
  }
  ElMessage.success('Order completed')
}

const handleCancel = async (order: ValetOrder) => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to cancel this order?',
      'Cancel Order',
      { type: 'warning' }
    )
    // TODO: Implement cancel logic
    ElMessage.success('Order cancelled')
  } catch {
    // User cancelled
  }
}

const handleView = (order: ValetOrder) => {
  router.push(`/valet/detail/${order.id}`)
}

// Export related
const exportDialogVisible = ref(false)
const exportForm = reactive({
  dateRange: null as [Date, Date] | null,
  status: [] as ValetStatus[],
  format: 'excel'
})

// Handle export button click
const handleExport = () => {
  exportDialogVisible.value = true
}

// Handle export confirmation
const handleExportConfirm = async () => {
  try {
    // Build export parameters
    const params = {
      startDate: exportForm.dateRange?.[0]?.toISOString(),
      endDate: exportForm.dateRange?.[1]?.toISOString(),
      status: exportForm.status,
      format: exportForm.format
    }

    // Simulate export process
    ElMessage.success('Export started, please wait...')
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Handle export based on different formats
    switch (exportForm.format) {
      case 'excel':
        console.log('Exporting to Excel:', params)
        ElMessage.success('Excel file exported successfully')
        break
      case 'csv':
        console.log('Exporting to CSV:', params)
        ElMessage.success('CSV file exported successfully')
        break
      case 'pdf':
        console.log('Exporting to PDF:', params)
        ElMessage.success('PDF file exported successfully')
        break
    }

    exportDialogVisible.value = false
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('Failed to export file')
  }
}

// Reset export form
watch(exportDialogVisible, (visible) => {
  if (!visible) {
    exportForm.dateRange = null
    exportForm.status = []
    exportForm.format = 'excel'
  }
})

// Format source display
const formatSource = (source: ValetSource): string => {
  const sourceMap: Record<ValetSource, string> = {
    [ValetSource.Online]: 'Online',
    [ValetSource.Offline]: 'Offline'
  }
  return sourceMap[source] || source
}

// Get source tag type
const getSourceType = (source: ValetSource): string => {
  const typeMap: Record<ValetSource, string> = {
    [ValetSource.Online]: 'primary',
    [ValetSource.Offline]: 'success'
  }
  return typeMap[source] || ''
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

// 添加控制变量
const createDialogVisible = ref(false)

// 添加创建成功的处理函数
const handleValetCreated = (order: ValetOrder) => {
  // 添加到列表开头
  orderList.value.unshift(order)
  ElMessage.success('New valet order created')
}

// 添加 loading 状态
const loading = ref(false)
</script>

<style scoped lang="scss">
.valet-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .car-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-tag {
        font-weight: bold;
      }

      .car-model {
        font-weight: 500;
        color: #303133;
      }

      .car-color {
        color: #909399;
      }
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

    &.el-dropdown-menu__item--divided {
      border-top: 1px solid var(--el-border-color-lighter);
      margin-top: 4px;
      padding-top: 12px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
}

.space-location {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .text-gray {
    color: #909399;
    font-style: italic;
  }
}

.ml-2 {
  margin-left: 8px;
}

.photo-dialog {
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    
    .photo-item {
      .photo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .required {
          color: var(--el-color-danger);
        }
      }
      
      .upload-box {
        :deep(.el-upload--picture-card) {
          width: 100%;
          height: 120px;
          
          .upload-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
        }
      }
      
      &:nth-last-child(-n+1) {
        grid-column: span 2;
      }
    }
  }
}

.driver-dialog {
  .driver-list {
    .driver-item {
      padding: 16px;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
      
      &.active {
        border-color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }

      .driver-info {
        .driver-name {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          
          span {
            font-size: 16px;
            font-weight: 500;
          }
        }

        .driver-contact {
          color: var(--el-text-color-secondary);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .driver-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .orders {
            color: var(--el-text-color-secondary);
            font-size: 13px;
          }
        }
      }
    }
  }
}

.pickup-dialog {
  .pickup-dialog {
    .order-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .label {
          font-weight: bold;
        }
        
        .value {
          margin-left: 8px;
        }
      }
    }
    
    .payment-status {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .payment-alert {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .el-alert {
          width: 100%;
        }
      }
    }
  }
}
</style>